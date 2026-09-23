import { ParseSourceSpan, TokenType } from "angular-html-parser";
import htmlWhitespace from "../utilities/html-whitespace.js";
import isNonEmptyArray from "../utilities/is-non-empty-array.js";
import {
  canHaveInterpolation,
  getLeadingAndTrailingHtmlWhitespace,
  getNodeCssStyleDisplay,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
} from "./utilities/index.js";

const PREPROCESS_PIPELINE = [
  convertAngularNonBindableNodesToText,
  removeIgnorableFirstLf,
  mergeIfConditionalStartEndCommentIntoElementOpeningTag,
  mergeCdataIntoText,
  extractInterpolation,
  extractWhitespaces,
  addCssDisplay,
  addIsSelfClosing,
  addHasHtmComponentClosingTag,
  addIsSpaceSensitive,
  mergeSimpleElementIntoText,
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    fn(ast, options);
  }

  return ast;
}

function removeIgnorableFirstLf(ast /* , options */) {
  ast.walk((node) => {
    if (
      node.kind === "element" &&
      node.tagDefinition.ignoreFirstLf &&
      node.children.length > 0 &&
      node.children[0].kind === "text" &&
      node.children[0].value[0] === "\n"
    ) {
      const text = node.children[0];
      if (text.value.length === 1) {
        node.removeChild(text);
      } else {
        text.value = text.value.slice(1);
      }
    }
  });
}

function mergeIfConditionalStartEndCommentIntoElementOpeningTag(
  ast /* , options */,
) {
  /**
   *     <!--[if ...]><!--><target><!--<![endif]-->
   */
  const isTarget = (node) =>
    node.kind === "element" &&
    node.prev?.kind === "ieConditionalStartComment" &&
    node.prev.sourceSpan.end.offset === node.startSourceSpan.start.offset &&
    node.firstChild?.kind === "ieConditionalEndComment" &&
    node.firstChild.sourceSpan.start.offset === node.startSourceSpan.end.offset;
  ast.walk((node) => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!isTarget(child)) {
          continue;
        }

        const ieConditionalStartComment = child.prev;
        const ieConditionalEndComment = child.firstChild;

        // ieConditionalStartComment
        node.removeChild(ieConditionalStartComment);
        i--; // because a node was removed

        const startSourceSpan = new ParseSourceSpan(
          ieConditionalStartComment.sourceSpan.start,
          ieConditionalEndComment.sourceSpan.end,
        );
        const sourceSpan = new ParseSourceSpan(
          startSourceSpan.start,
          child.sourceSpan.end,
        );

        child.condition = ieConditionalStartComment.condition;
        child.sourceSpan = sourceSpan;
        child.startSourceSpan = startSourceSpan;
        child.removeChild(ieConditionalEndComment);
      }
    }
  });
}

function convertAngularNonBindableNodesToText(ast, options) {
  if (
    options.parser !== "angular" ||
    !options.originalText.includes("ngNonBindable")
  ) {
    return;
  }

  ast.walk((node) => {
    if (
      node.kind === "element" &&
      Object.hasOwn(node.attrMap, "ngNonBindable")
    ) {
      convertAngularNonBindableChildren(node, options);
    }
  });
}

// TODO: Avoid recursive call
function convertAngularNonBindableChildren(node, options) {
  const { children } = node;
  if (!children) {
    return;
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.kind === "angularControlFlowBlock") {
      convertAngularNonBindableChildren(child, options);

      const replacements = [];
      let { start } = child.sourceSpan;
      for (const blockChild of child.children) {
        if (start.offset < blockChild.sourceSpan.start.offset) {
          const sourceSpan = new ParseSourceSpan(
            start,
            blockChild.sourceSpan.start,
          );
          replacements.push(createOriginalTextNode(sourceSpan, options));
        }

        replacements.push(blockChild);
        start = blockChild.sourceSpan.end;
      }

      if (start.offset < child.sourceSpan.end.offset) {
        const sourceSpan = new ParseSourceSpan(start, child.sourceSpan.end);
        replacements.push(createOriginalTextNode(sourceSpan, options));
      }

      for (const replacement of replacements) {
        node.insertChildBefore(child, replacement);
      }
      node.removeChild(child);

      i += replacements.length - 1;
      continue;
    }

    if (child.kind === "angularLetDeclaration") {
      node.replaceChild(
        child,
        createOriginalTextNode(child.sourceSpan, options),
      );
      continue;
    }

    convertAngularNonBindableChildren(child, options);
  }
}

function createOriginalTextNode(sourceSpan, options) {
  return {
    kind: "text",
    value: options.originalText.slice(
      sourceSpan.start.offset,
      sourceSpan.end.offset,
    ),
    sourceSpan,
  };
}

function mergeNodeIntoText(ast, shouldMerge, getValue) {
  ast.walk((node) => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (child.kind !== "text" && !shouldMerge(child)) {
          continue;
        }

        if (child.kind !== "text") {
          child.kind = "text";
          child.value = getValue(child);
        }

        const prevChild = child.prev;
        if (!prevChild || prevChild.kind !== "text") {
          continue;
        }

        prevChild.value += child.value;
        prevChild.sourceSpan = new ParseSourceSpan(
          prevChild.sourceSpan.start,
          child.sourceSpan.end,
        );

        node.removeChild(child);
        i--; // because a node was removed
      }
    }
  });
}

function mergeCdataIntoText(ast /* , options */) {
  return mergeNodeIntoText(
    ast,
    (node) => node.kind === "cdata",
    (node) => `<![CDATA[${node.value}]]>`,
  );
}

function mergeSimpleElementIntoText(ast /* , options */) {
  const isSimpleElement = (node) =>
    node.kind === "element" &&
    node.attrs.length === 0 &&
    !isNonEmptyArray(node.startTagComments) &&
    node.children.length === 1 &&
    node.firstChild.kind === "text" &&
    !htmlWhitespace.hasWhitespaceCharacter(node.children[0].value) &&
    !node.firstChild.hasLeadingSpaces &&
    !node.firstChild.hasTrailingSpaces &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces &&
    node.prev?.kind === "text" &&
    node.next?.kind === "text";
  ast.walk((node) => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!isSimpleElement(child)) {
          continue;
        }

        const prevChild = child.prev;
        const nextChild = child.next;
        prevChild.value +=
          `<${child.rawName}>` +
          child.firstChild.value +
          `</${child.rawName}>` +
          nextChild.value;
        prevChild.sourceSpan = new ParseSourceSpan(
          prevChild.sourceSpan.start,
          nextChild.sourceSpan.end,
        );
        prevChild.isTrailingSpaceSensitive = nextChild.isTrailingSpaceSensitive;
        prevChild.hasTrailingSpaces = nextChild.hasTrailingSpaces;

        node.removeChild(child);
        i--; // because a node was removed
        node.removeChild(nextChild);
      }
    }
  });
}

function extractInterpolation(ast, options) {
  if (options.parser === "html") {
    return;
  }

  const interpolationRegex = /\{\{(.+?)\}\}/s;
  ast.walk((node) => {
    if (!canHaveInterpolation(node, options)) {
      return;
    }

    const { children } = node;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.kind !== "text") {
        continue;
      }

      let startSourceSpan = child.sourceSpan.start;
      let endSourceSpan;
      const components =
        options.parser === "angular"
          ? splitAngularInterpolation(child, interpolationRegex)
          : child.value.split(interpolationRegex);
      const replacements = [];

      for (
        let j = 0;
        j < components.length;
        j++, startSourceSpan = endSourceSpan
      ) {
        const value = components[j];

        if (j % 2 === 0) {
          endSourceSpan = startSourceSpan.moveBy(value.length);
          if (value.length > 0) {
            replacements.push({
              kind: "text",
              value,
              sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
            });
          }
          continue;
        }

        endSourceSpan = startSourceSpan.moveBy(value.length + 4); // `{{` + `}}`
        replacements.push({
          kind: "interpolation",
          sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
          children:
            value.length === 0
              ? []
              : [
                  {
                    kind: "text",
                    value,
                    sourceSpan: new ParseSourceSpan(
                      startSourceSpan.moveBy(2),
                      endSourceSpan.moveBy(-2),
                    ),
                  },
                ],
        });
      }

      children.splice(
        i,
        1,
        ...replacements.map((replacement) => node.createChild(replacement)),
      );
      i += replacements.length - 1;
    }
  });
}

function splitAngularInterpolation(child, interpolationRegex) {
  if (!child.tokens) {
    return child.value.split(interpolationRegex);
  }

  const interpolationTokens = child.tokens.filter(
    (token) =>
      token.type === TokenType.INTERPOLATION &&
      token.parts.length === 3 &&
      token.parts[1].length > 0,
  );

  const components = [];
  const { content } = child.sourceSpan.start.file;
  let startSourceSpan = child.sourceSpan.start;

  for (const { sourceSpan } of interpolationTokens) {
    components.push(
      content.slice(startSourceSpan.offset, sourceSpan.start.offset),
      content.slice(sourceSpan.start.offset + 2, sourceSpan.end.offset - 2),
    );

    startSourceSpan = sourceSpan.end;
  }

  components.push(
    content.slice(startSourceSpan.offset, child.sourceSpan.end.offset),
  );

  return components;
}

/**
 * - add `hasLeadingSpaces` field
 * - add `hasTrailingSpaces` field
 * - add `hasDanglingSpaces` field for parent nodes
 * - add `isWhitespaceSensitive`, `isIndentationSensitive` field for text nodes
 * - remove insensitive whitespaces
 */
function extractWhitespaces(ast, options) {
  ast.walk((node) => {
    const children = node.$children;

    if (!children) {
      return;
    }

    if (
      children.length === 0 ||
      (children.length === 1 &&
        children[0].kind === "text" &&
        htmlWhitespace.trim(children[0].value).length === 0)
    ) {
      node.hasDanglingSpaces = children.length > 0;
      node.$children = [];
      return;
    }

    const isWhitespaceSensitive = isWhitespaceSensitiveNode(node, options);
    const isIndentationSensitive = isIndentationSensitiveNode(node);

    if (!isWhitespaceSensitive) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.kind !== "text") {
          continue;
        }

        const { leadingWhitespace, text, trailingWhitespace } =
          getLeadingAndTrailingHtmlWhitespace(child.value);

        const prevChild = child.prev;
        const nextChild = child.next;

        if (!text) {
          node.removeChild(child);
          i--; // because a node was removed

          if (leadingWhitespace || trailingWhitespace) {
            if (prevChild) {
              prevChild.hasTrailingSpaces = true;
            }
            if (nextChild) {
              nextChild.hasLeadingSpaces = true;
            }
          }
        } else {
          child.value = text;
          child.sourceSpan = new ParseSourceSpan(
            child.sourceSpan.start.moveBy(leadingWhitespace.length),
            child.sourceSpan.end.moveBy(-trailingWhitespace.length),
          );

          if (leadingWhitespace) {
            if (prevChild) {
              prevChild.hasTrailingSpaces = true;
            }
            child.hasLeadingSpaces = true;
          }
          if (trailingWhitespace) {
            child.hasTrailingSpaces = true;
            if (nextChild) {
              nextChild.hasLeadingSpaces = true;
            }
          }
        }
      }
    }

    node.isWhitespaceSensitive = isWhitespaceSensitive;
    node.isIndentationSensitive = isIndentationSensitive;
  });
}

function addIsSelfClosing(ast /* , options */) {
  ast.walk((node) => {
    node.isSelfClosing =
      !node.children ||
      (node.kind === "element" &&
        (node.tagDefinition.isVoid ||
          // self-closing
          (node.endSourceSpan &&
            node.startSourceSpan.start === node.endSourceSpan.start &&
            node.startSourceSpan.end === node.endSourceSpan.end)));
  });
}

function addHasHtmComponentClosingTag(ast, options) {
  ast.walk((node) => {
    if (node.kind !== "element") {
      return;
    }

    node.hasHtmComponentClosingTag =
      node.endSourceSpan &&
      /^<\s*\/\s*\/\s*>$/.test(
        options.originalText.slice(
          node.endSourceSpan.start.offset,
          node.endSourceSpan.end.offset,
        ),
      );
  });
}

function addCssDisplay(ast, options) {
  ast.walk((node) => {
    node.cssDisplay = getNodeCssStyleDisplay(node, options);
  });
}

/**
 * - add `isLeadingSpaceSensitive` field
 * - add `isTrailingSpaceSensitive` field
 * - add `isDanglingSpaceSensitive` field for parent nodes
 */
function addIsSpaceSensitive(ast, options) {
  ast.walk((node) => {
    const { children } = node;
    if (!children) {
      return;
    }
    if (children.length === 0) {
      node.isDanglingSpaceSensitive = isDanglingSpaceSensitiveNode(
        node,
        options,
      );
      return;
    }
    for (const child of children) {
      child.isLeadingSpaceSensitive = isLeadingSpaceSensitiveNode(
        child,
        options,
      );
      child.isTrailingSpaceSensitive = isTrailingSpaceSensitiveNode(
        child,
        options,
      );
    }
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      child.isLeadingSpaceSensitive =
        index === 0
          ? child.isLeadingSpaceSensitive
          : child.prev.isTrailingSpaceSensitive &&
            child.isLeadingSpaceSensitive;
      child.isTrailingSpaceSensitive =
        index === children.length - 1
          ? child.isTrailingSpaceSensitive
          : child.next.isLeadingSpaceSensitive &&
            child.isTrailingSpaceSensitive;
    }
  });
}

export default preprocess;
