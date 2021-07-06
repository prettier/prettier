"use strict";

const {
  ParseSourceSpan,
} = require("angular-html-parser/lib/compiler/src/parse_util");
const getLast = require("../utils/get-last");
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
} = require("./utils");

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
      const [text, ...rest] = node.children;
      node.setChildren(
        text.value.length === 1
          ? rest
          : [text.clone({ value: text.value.slice(1) }), ...rest]
      );
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
      const isTargetResults = node.children.map(isTarget);
      if (isTargetResults.some(Boolean)) {
        const newChildren = [];

        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (isTargetResults[i + 1]) {
            // ieConditionalStartComment
            continue;
          }

          if (isTargetResults[i]) {
            const ieConditionalStartComment = child.prev;
            const ieConditionalEndComment = child.firstChild;

            const startSourceSpan = new ParseSourceSpan(
              ieConditionalStartComment.sourceSpan.start,
              ieConditionalEndComment.sourceSpan.end
            );
            const sourceSpan = new ParseSourceSpan(
              startSourceSpan.start,
              child.sourceSpan.end
            );

            newChildren.push(
              child.clone({
                condition: ieConditionalStartComment.condition,
                sourceSpan,
                startSourceSpan,
                children: child.children.slice(1),
              })
            );

            continue;
          }

          newChildren.push(child);
        }

        node.setChildren(newChildren);
      }
    }
  });
}

function mergeNodeIntoText(ast, shouldMerge, getValue) {
  ast.walk((node) => {
    if (node.children) {
      const shouldMergeResults = node.children.map(shouldMerge);
      if (shouldMergeResults.some(Boolean)) {
        const newChildren = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (child.type !== "text" && !shouldMergeResults[i]) {
            newChildren.push(child);
            continue;
          }

          const newChild =
            child.type === "text"
              ? child
              : child.clone({ type: "text", value: getValue(child) });

          if (
            newChildren.length === 0 ||
            getLast(newChildren).type !== "text"
          ) {
            newChildren.push(newChild);
            continue;
          }

          const lastChild = newChildren.pop();
          newChildren.push(
            lastChild.clone({
              value: lastChild.value + newChild.value,
              sourceSpan: new ParseSourceSpan(
                lastChild.sourceSpan.start,
                newChild.sourceSpan.end
              ),
            })
          );
        }
        node.setChildren(newChildren);
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
      const isSimpleElementResults = node.children.map(isSimpleElement);
      if (isSimpleElementResults.some(Boolean)) {
        const newChildren = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (isSimpleElementResults[i]) {
            const lastChild = newChildren.pop();
            const nextChild = node.children[++i];
            const { isTrailingSpaceSensitive, hasTrailingSpaces } = nextChild;
            newChildren.push(
              lastChild.clone({
                value:
                  lastChild.value +
                  `<${child.rawName}>` +
                  child.firstChild.value +
                  `</${child.rawName}>` +
                  nextChild.value,
                sourceSpan: new ParseSourceSpan(
                  lastChild.sourceSpan.start,
                  nextChild.sourceSpan.end
                ),
                isTrailingSpaceSensitive,
                hasTrailingSpaces,
              })
            );
          } else {
            newChildren.push(child);
          }
        }
        node.setChildren(newChildren);
      }
    }
  });
}

function extractInterpolation(ast, options) {
  if (options.parser === "html") {
    return;
  }

  const interpolationRegex = /{{(.+?)}}/gs;
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
const WHITESPACE_NODE = { type: "whitespace" };
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

    node.setChildren(
      node.children
        // extract whitespace nodes
        .flatMap((child) => {
          if (child.type !== "text" || isWhitespaceSensitive) {
            return child;
          }

          const localChildren = [];

          const { leadingWhitespace, text, trailingWhitespace } =
            getLeadingAndTrailingHtmlWhitespace(child.value);

          if (leadingWhitespace) {
            localChildren.push(WHITESPACE_NODE);
          }

          if (text) {
            localChildren.push({
              type: "text",
              value: text,
              sourceSpan: new ParseSourceSpan(
                child.sourceSpan.start.moveBy(leadingWhitespace.length),
                child.sourceSpan.end.moveBy(-trailingWhitespace.length)
              ),
            });
          }

          if (trailingWhitespace) {
            localChildren.push(WHITESPACE_NODE);
          }

          return localChildren;
        })
        // set hasLeadingSpaces/hasTrailingSpaces
        .map((child, index, children) => {
          if (child === WHITESPACE_NODE) {
            return;
          }

          return {
            ...child,
            hasLeadingSpaces: children[index - 1] === WHITESPACE_NODE,
            hasTrailingSpaces: children[index + 1] === WHITESPACE_NODE,
          };
        })
        // filter whitespace nodes
        .filter(Boolean)
    );
    node.isWhitespaceSensitive = isWhitespaceSensitive;
    node.isIndentationSensitive = isIndentationSensitive;
  });
}

function addIsSelfClosing(ast /*, options */) {
  ast.walk((node) =>
    Object.assign(node, {
      isSelfClosing:
        !node.children ||
        (node.type === "element" &&
          (node.tagDefinition.isVoid ||
            // self-closing
            node.startSourceSpan === node.endSourceSpan)),
    })
  );
}

function addHasHtmComponentClosingTag(ast, options) {
  ast.walk((node) =>
    node.type !== "element"
      ? node
      : Object.assign(node, {
          hasHtmComponentClosingTag:
            node.endSourceSpan &&
            /^<\s*\/\s*\/\s*>$/.test(
              options.originalText.slice(
                node.endSourceSpan.start.offset,
                node.endSourceSpan.end.offset
              )
            ),
        })
  );
}

function addCssDisplay(ast, options) {
  ast.walk((node) =>
    Object.assign(node, { cssDisplay: getNodeCssStyleDisplay(node, options) })
  );
}

/**
 * - add `isLeadingSpaceSensitive` field
 * - add `isTrailingSpaceSensitive` field
 * - add `isDanglingSpaceSensitive` field for parent nodes
 */
function addIsSpaceSensitive(ast, options) {
  ast.walk((node) => {
    if (!node.children) {
      return;
    }

    if (node.children.length === 0) {
      node.isDanglingSpaceSensitive = isDanglingSpaceSensitiveNode(node);
      return;
    }

    node.setChildren(
      node.children
        .map((child) => ({
          ...child,
          isLeadingSpaceSensitive: isLeadingSpaceSensitiveNode(child, options),
          isTrailingSpaceSensitive: isTrailingSpaceSensitiveNode(
            child,
            options
          ),
        }))
        .map((child, index, children) => ({
          ...child,
          isLeadingSpaceSensitive:
            index === 0
              ? child.isLeadingSpaceSensitive
              : children[index - 1].isTrailingSpaceSensitive &&
                child.isLeadingSpaceSensitive,
          isTrailingSpaceSensitive:
            index === children.length - 1
              ? child.isTrailingSpaceSensitive
              : children[index + 1].isLeadingSpaceSensitive &&
                child.isTrailingSpaceSensitive,
        }))
    );
  });
}

module.exports = preprocess;
