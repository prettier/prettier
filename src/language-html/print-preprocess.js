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
} = require("./utils.js");

const PREPROCESS_PIPELINE = [
  removeIgnorableFirstLf,
  mergeIeConditonalStartEndCommentIntoElementOpeningTag,
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
  const res = ast.map((node) => node);
  for (const fn of PREPROCESS_PIPELINE) {
    fn(res, options);
  }
  return res;
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

function mergeIeConditonalStartEndCommentIntoElementOpeningTag(
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

        const ieConditionalStartComment = node.children[i - 1];
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

        const prevChild = node.children[i - 1];
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

        const prevChild = node.children[i - 1];
        const nextChild = node.children[++i];
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
        i--; // because a node was removed
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

    const newChildren = [];

    for (const child of node.children) {
      if (child.type !== "text") {
        newChildren.push(child);
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
            newChildren.push({
              type: "text",
              value,
              sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
            });
          }
          continue;
        }

        endSourceSpan = startSourceSpan.moveBy(value.length + 4); // `{{` + `}}`
        newChildren.push({
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
    }

    node.setChildren(newChildren);
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

        const prevChild = node.children[i - 1];
        const nextChild = node.children[i + 1];

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
          : children[index - 1].isTrailingSpaceSensitive &&
            child.isLeadingSpaceSensitive;
      child.isTrailingSpaceSensitive =
        index === children.length - 1
          ? child.isTrailingSpaceSensitive
          : children[index + 1].isLeadingSpaceSensitive &&
            child.isTrailingSpaceSensitive;
    }
  });
}

module.exports = preprocess;
