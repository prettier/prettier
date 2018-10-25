"use strict";

const {
  canHaveInterpolation,
  getNodeCssStyleDisplay,
  getPrevNode,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
  mapNode
} = require("./utils");

const PREPROCESS_PIPELINE = [
  removeIgnorableFirstLf,
  mergeCdataIntoText,
  extractInterpolation,
  addIsSelfClosing,
  extractWhitespaces,
  addCssDisplay,
  addIsSpaceSensitive,
  addShortcuts
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    ast = fn(ast, options);
  }
  return ast;
}

function removeIgnorableFirstLf(ast /*, options */) {
  return mapNode(ast, node => {
    if (
      node.type === "element" &&
      node.tagDefinition.ignoreFirstLf &&
      node.children.length !== 0 &&
      node.children[0].type === "text" &&
      node.children[0].value[0] === "\n"
    ) {
      const text = node.children[0];
      return Object.assign({}, node, {
        children:
          text.value.length === 1
            ? node.children.slice(1)
            : [].concat(
                Object.assign({}, text, { value: text.value.slice(1) }),
                node.children.slice(1)
              )
      });
    }
    return node;
  });
}

function mergeCdataIntoText(ast /*, options */) {
  return mapNode(ast, node => {
    if (node.children && node.children.some(child => child.type === "cdata")) {
      const newChildren = [];
      for (const child of node.children) {
        if (child.type !== "text" && child.type !== "cdata") {
          newChildren.push(child);
          continue;
        }

        const newChild =
          child.type === "text"
            ? child
            : Object.assign({}, child, {
                type: "text",
                value: `<![CDATA[${child.value}]]>`
              });

        if (
          newChildren.length === 0 ||
          newChildren[newChildren.length - 1].type !== "text"
        ) {
          newChildren.push(newChild);
          continue;
        }

        const lastChild = newChildren.pop();
        const ParseSourceSpan = lastChild.sourceSpan.constructor;
        newChildren.push(
          Object.assign({}, lastChild, {
            value: lastChild.value + newChild.value,
            sourceSpan: new ParseSourceSpan(
              lastChild.sourceSpan.start,
              newChild.sourceSpan.end
            )
          })
        );
      }
      return Object.assign({}, node, { children: newChildren });
    }

    return node;
  });
}

function extractInterpolation(ast, options) {
  if (options.parser === "html") {
    return ast;
  }

  const interpolationRegex = /\{\{([\s\S]+?)\}\}/g;
  return mapNode(ast, node => {
    if (!canHaveInterpolation(node)) {
      return node;
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
          if (value.length !== 0) {
            newChildren.push({
              type: "text",
              value,
              sourceSpan: { start: startSourceSpan, end: endSourceSpan }
            });
          }
          continue;
        }

        endSourceSpan = startSourceSpan.moveBy(value.length + 4); // `{{` + `}}`
        newChildren.push({
          type: "interpolation",
          sourceSpan: { start: startSourceSpan, end: endSourceSpan },
          children:
            value.length === 0
              ? []
              : [
                  {
                    type: "text",
                    value,
                    sourceSpan: {
                      start: startSourceSpan.moveBy(2),
                      end: endSourceSpan.moveBy(-2)
                    }
                  }
                ]
        });
      }
    }

    return Object.assign({}, node, { children: newChildren });
  });
}

/** add `isSelfClosing` for void tags, directives, and comments */
function addIsSelfClosing(ast /*, options */) {
  return mapNode(ast, node => {
    if (
      !node.children ||
      (node.type === "element" &&
        (node.tagDefinition.isVoid ||
          // self-closing
          node.startSourceSpan === node.endSourceSpan))
    ) {
      return Object.assign({}, node, { isSelfClosing: true });
    }
    return node;
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
  const TYPE_WHITESPACE = "whitespace";
  return mapNode(ast, node => {
    if (!node.children) {
      return node;
    }

    if (
      node.children.length === 0 ||
      (node.children.length === 1 &&
        node.children[0].type === "text" &&
        node.children[0].value.trim().length === 0)
    ) {
      return Object.assign({}, node, {
        children: [],
        hasDanglingSpaces: node.children.length !== 0
      });
    }

    const isWhitespaceSensitive = isWhitespaceSensitiveNode(node);
    const isIndentationSensitive = isIndentationSensitiveNode(node);

    return Object.assign({}, node, {
      children: node.children
        // extract whitespace nodes
        .reduce((newChildren, child) => {
          if (child.type !== "text") {
            return newChildren.concat(child);
          }

          if (isWhitespaceSensitive) {
            return newChildren.concat(
              Object.assign({}, child, {
                isWhitespaceSensitive,
                isIndentationSensitive
              })
            );
          }

          const localChildren = [];

          const [, leadingSpaces, text, trailingSpaces] = child.value.match(
            /^(\s*)([\s\S]*?)(\s*)$/
          );

          if (leadingSpaces) {
            localChildren.push({ type: TYPE_WHITESPACE });
          }

          if (text) {
            localChildren.push({
              type: "text",
              value: text,
              sourceSpan: {
                start: child.sourceSpan.start.moveBy(leadingSpaces.length),
                end: child.sourceSpan.end.moveBy(-trailingSpaces.length)
              }
            });
          }

          if (trailingSpaces) {
            localChildren.push({ type: TYPE_WHITESPACE });
          }

          return newChildren.concat(localChildren);
        }, [])
        // set hasLeadingSpaces/hasTrailingSpaces and filter whitespace nodes
        .reduce((newChildren, child, i, children) => {
          if (child.type === TYPE_WHITESPACE) {
            return newChildren;
          }

          const hasLeadingSpaces =
            i !== 0 && children[i - 1].type === TYPE_WHITESPACE;
          const hasTrailingSpaces =
            i !== children.length - 1 &&
            children[i + 1].type === TYPE_WHITESPACE;

          return newChildren.concat(
            Object.assign({}, child, {
              hasLeadingSpaces,
              hasTrailingSpaces
            })
          );
        }, [])
    });
  });
}

function addCssDisplay(ast, options) {
  return mapNode(ast, (node, stack) => {
    const prevNode = getPrevNode(stack);
    return Object.assign({}, node, {
      cssDisplay: getNodeCssStyleDisplay(node, prevNode, options)
    });
  });
}

/**
 * - add `isLeadingSpaceSensitive` field
 * - add `isTrailingSpaceSensitive` field
 * - add `isDanglingSpaceSensitive` field for parent nodes
 */
function addIsSpaceSensitive(ast /*, options */) {
  return mapNode(ast, node => {
    if (!node.children) {
      return node;
    }

    if (node.children.length === 0) {
      return Object.assign({}, node, {
        isDanglingSpaceSensitive: isDanglingSpaceSensitiveNode(node)
      });
    }

    return Object.assign({}, node, {
      children: node.children
        // set isLeadingSpaceSensitive
        .map((child, i, children) => {
          const prevChild = i === 0 ? null : children[i - 1];
          const nextChild = i === children.length - 1 ? null : children[i + 1];
          return Object.assign({}, child, {
            isLeadingSpaceSensitive: isLeadingSpaceSensitiveNode(child, {
              parent: node,
              prev: prevChild,
              next: nextChild
            })
          });
        })
        // set isTrailingSpaceSensitive and update isLeadingSpaceSensitive if necessary
        .reduce((newChildren, child, i, children) => {
          const prevChild = i === 0 ? null : newChildren[i - 1];
          const nextChild = i === children.length - 1 ? null : children[i + 1];
          const isTrailingSpaceSensitive =
            nextChild && !nextChild.isLeadingSpaceSensitive
              ? false
              : isTrailingSpaceSensitiveNode(child, {
                  parent: node,
                  prev: prevChild,
                  next: nextChild
                });
          return newChildren.concat(
            Object.assign(
              {},
              child,
              { isTrailingSpaceSensitive },
              prevChild &&
              !prevChild.isTrailingSpaceSensitive &&
              child.isLeadingSpaceSensitive
                ? { isLeadingSpaceSensitive: false }
                : null
            )
          );
        }, [])
    });
  });
}

function addShortcuts(ast /*, options */) {
  function _addShortcuts(node, parent, index) {
    const prev = index === -1 ? null : parent.children[index - 1];
    const next = index === -1 ? null : parent.children[index + 1];

    const hasChildren = node.children && node.children.length !== 0;

    const firstChild = !hasChildren ? null : node.children[0];
    const lastChild = !hasChildren
      ? null
      : node.children[node.children.length - 1];

    Object.defineProperties(node, {
      parent: { value: parent, enumerable: false },
      prev: { value: prev, enumerable: false },
      next: { value: next, enumerable: false },
      firstChild: { value: firstChild, enumerable: false },
      lastChild: { value: lastChild, enumerable: false }
    });

    if (node.children) {
      node.children.forEach((child, childIndex) =>
        _addShortcuts(child, node, childIndex)
      );
    }
  }

  _addShortcuts(ast, null, -1);
  return ast;
}

module.exports = preprocess;
