import { ParseSourceSpan } from "angular-html-parser";
import htmlWhitespace from "../utilities/html-whitespace.js";
import {
  canHaveInterpolation,
  getInterpolationRanges,
  getLeadingAndTrailingHtmlWhitespace,
  getNodeCssStyleDisplay,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
} from "./utilities/index.js";

const PREPROCESS_PIPELINE = [
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

  ast.walk((node) => {
    if (!canHaveInterpolation(node, options)) {
      return;
    }

    for (const child of node.children) {
      if (child.kind !== "text") {
        continue;
      }

      const text = child.value;
      const ranges = getInterpolationRanges(text);

      if (ranges.length === 0) {
        continue;
      }

      let lastEnd = 0;
      let startSourceSpan = child.sourceSpan.start;

      for (const range of ranges) {
        // Insert text before this interpolation
        if (range.start > lastEnd) {
          const textBefore = text.slice(lastEnd, range.start);
          const endSourceSpan = startSourceSpan.moveBy(textBefore.length);
          if (textBefore.length > 0) {
            node.insertChildBefore(child, {
              kind: "text",
              value: textBefore,
              sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
            });
          }
          startSourceSpan = endSourceSpan;
        }

        // Insert the interpolation
        const endSourceSpan = startSourceSpan.moveBy(range.content.length + 4); // `{{` + `}}`
        node.insertChildBefore(child, {
          kind: "interpolation",
          sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
          children:
            range.content.length === 0
              ? []
              : [
                  {
                    kind: "text",
                    value: range.content,
                    sourceSpan: new ParseSourceSpan(
                      startSourceSpan.moveBy(2),
                      endSourceSpan.moveBy(-2),
                    ),
                  },
                ],
        });

        lastEnd = range.end;
        startSourceSpan = endSourceSpan;
      }

      // Insert remaining text after last interpolation
      if (lastEnd < text.length) {
        const textAfter = text.slice(lastEnd);
        if (textAfter.length > 0) {
          node.insertChildBefore(child, {
            kind: "text",
            value: textAfter,
            sourceSpan: new ParseSourceSpan(
              startSourceSpan,
              child.sourceSpan.end,
            ),
          });
        }
      }

      node.removeChild(child);
    }
  });
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
