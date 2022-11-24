"use strict";

const {
  ParseSourceSpan,
} = require("angular-html-parser/lib/compiler/src/parse_util");
const {
  htmlTrim,
  getLeadingAndTrailingHtmlWhitespace,
  hasHtmlWhitespace,
  canHaveInterpolation,
  getNodeCssStyleDisplay,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
  isVueScriptTag,
} = require("./utils/index.js");

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
  markTsScript,
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    fn(ast, options);
  }
  return ast;
}

function removeIgnorableFirstLf(ast /*, options */) {
  ast.walk((node) => {
    if (
      node.type === "element" &&
      node.tagDefinition.ignoreFirstLf &&
      node.children.length > 0 &&
      node.children[0].type === "text" &&
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
  ast /*, options */
) {
  /**
   *     <!--[if ...]><!--><target><!--<![endif]-->
   */
  const isTarget = (node) =>
    node.type === "element" &&
    node.prev &&
    node.prev.type === "ieConditionalStartComment" &&
    node.prev.sourceSpan.end.offset === node.startSourceSpan.start.offset &&
    node.firstChild &&
    node.firstChild.type === "ieConditionalEndComment" &&
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
          ieConditionalEndComment.sourceSpan.end
        );
        const sourceSpan = new ParseSourceSpan(
          startSourceSpan.start,
          child.sourceSpan.end
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

        if (child.type !== "text" && !shouldMerge(child)) {
          continue;
        }

        if (child.type !== "text") {
          child.type = "text";
          child.value = getValue(child);
        }

        const prevChild = child.prev;
        if (!prevChild || prevChild.type !== "text") {
          continue;
        }

        prevChild.value += child.value;
        prevChild.sourceSpan = new ParseSourceSpan(
          prevChild.sourceSpan.start,
          child.sourceSpan.end
        );

        node.removeChild(child);
        i--; // because a node was removed
      }
    }
  });
}

function mergeCdataIntoText(ast /*, options */) {
  return mergeNodeIntoText(
    ast,
    (node) => node.type === "cdata",
    (node) => `<![CDATA[${node.value}]]>`
  );
}

function mergeSimpleElementIntoText(ast /*, options */) {
  const isSimpleElement = (node) =>
    node.type === "element" &&
    node.attrs.length === 0 &&
    node.children.length === 1 &&
    node.firstChild.type === "text" &&
    !hasHtmlWhitespace(node.children[0].value) &&
    !node.firstChild.hasLeadingSpaces &&
    !node.firstChild.hasTrailingSpaces &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces &&
    node.prev &&
    node.prev.type === "text" &&
    node.next &&
    node.next.type === "text";
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
          nextChild.sourceSpan.end
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

  const interpolationRegex = /{{(.+?)}}/s;
  ast.walk((node) => {
    if (!canHaveInterpolation(node)) {
      return;
    }

    for (const child of node.children) {
      if (child.type !== "text") {
        continue;
      }

      let startSourceSpan = child.sourceSpan.start;
      let endSourceSpan = null;
      const components = child.value.split(interpolationRegex);
      for (
        let i = 0;
        i < components.length;
        i++, startSourceSpan = endSourceSpan
      ) {
        const value = components[i];

        if (i % 2 === 0) {
          endSourceSpan = startSourceSpan.moveBy(value.length);
          if (value.length > 0) {
            node.insertChildBefore(child, {
              type: "text",
              value,
              sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
            });
          }
          continue;
        }

        endSourceSpan = startSourceSpan.moveBy(value.length + 4); // `{{` + `}}`
        node.insertChildBefore(child, {
          type: "interpolation",
          sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
          children:
            value.length === 0
              ? []
              : [
                  {
                    type: "text",
                    value,
                    sourceSpan: new ParseSourceSpan(
                      startSourceSpan.moveBy(2),
                      endSourceSpan.moveBy(-2)
                    ),
                  },
                ],
        });
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
function extractWhitespaces(ast /*, options*/) {
  ast.walk((node) => {
    if (!node.children) {
      return;
    }

    if (
      node.children.length === 0 ||
      (node.children.length === 1 &&
        node.children[0].type === "text" &&
        htmlTrim(node.children[0].value).length === 0)
    ) {
      node.hasDanglingSpaces = node.children.length > 0;
      node.children = [];
      return;
    }

    const isWhitespaceSensitive = isWhitespaceSensitiveNode(node);
    const isIndentationSensitive = isIndentationSensitiveNode(node);

    if (!isWhitespaceSensitive) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type !== "text") {
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
            child.sourceSpan.end.moveBy(-trailingWhitespace.length)
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

function addIsSelfClosing(ast /*, options */) {
  ast.walk((node) => {
    node.isSelfClosing =
      !node.children ||
      (node.type === "element" &&
        (node.tagDefinition.isVoid ||
          // self-closing
          node.startSourceSpan === node.endSourceSpan));
  });
}

function addHasHtmComponentClosingTag(ast, options) {
  ast.walk((node) => {
    if (node.type !== "element") {
      return;
    }

    node.hasHtmComponentClosingTag =
      node.endSourceSpan &&
      /^<\s*\/\s*\/\s*>$/.test(
        options.originalText.slice(
          node.endSourceSpan.start.offset,
          node.endSourceSpan.end.offset
        )
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
      node.isDanglingSpaceSensitive = isDanglingSpaceSensitiveNode(node);
      return;
    }
    for (const child of children) {
      child.isLeadingSpaceSensitive = isLeadingSpaceSensitiveNode(
        child,
        options
      );
      child.isTrailingSpaceSensitive = isTrailingSpaceSensitiveNode(
        child,
        options
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

function markTsScript(ast, options) {
  if (options.parser === "vue") {
    const vueScriptTag = ast.children.find((child) =>
      isVueScriptTag(child, options)
    );
    if (!vueScriptTag) {
      return;
    }
    const { lang } = vueScriptTag.attrMap;
    if (lang === "ts" || lang === "typescript") {
      options.__should_parse_vue_template_with_ts = true;
    }
  }
}

module.exports = preprocess;
