"use strict";

const {
  VOID_TAGS,
  isDanglingSpaceSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  mapNode
} = require("./utils");
const LineAndColumn = (m => m.default || m)(require("lines-and-columns"));

const PREPROCESS_PIPELINE = [
  renameScriptAndStyleWithTag,
  processDirectives,
  addIsSelfClosing,
  extractWhitespaces,
  addStartAndEndLocation,
  addShortcuts
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    ast = fn(ast, options);
  }
  return ast;
}

/** add `startLocation` and `endLocation` field */
function addStartAndEndLocation(ast, options) {
  const locator = new LineAndColumn(options.originalText);
  return mapNode(ast, node => {
    const startLocation = locator.locationForIndex(options.locStart(node));
    const endLocation = locator.locationForIndex(options.locEnd(node) - 1);
    return Object.assign({}, node, { startLocation, endLocation });
  });
}

/** rename `script` and `style` with `tag` */
function renameScriptAndStyleWithTag(ast /*, options */) {
  return mapNode(ast, node => {
    return node.type === "script" || node.type === "style"
      ? Object.assign({}, node, { type: "tag" })
      : node;
  });
}

/** add `isSelfClosing` for void tags, directives, and comments */
function addIsSelfClosing(ast /*, options */) {
  return mapNode(ast, node => {
    if (
      (node.type === "tag" && node.name in VOID_TAGS) ||
      node.type === "directive" ||
      node.type === "comment"
    ) {
      return Object.assign({}, node, { isSelfClosing: true });
    }
    return node;
  });
}

function processDirectives(ast /*, options */) {
  return mapNode(ast, node => {
    if (node.type !== "directive") {
      return node;
    }

    const isDoctype = /^!doctype$/i.test(node.name);
    const data = node.data.slice(node.name.length).replace(/\s+/g, " ");

    return Object.assign({}, node, {
      name: isDoctype ? "!DOCTYPE" : node.name,
      data: isDoctype ? data.replace(/^\s+html/i, " html") : data
    });
  });
}

/** add `hasLeadingSpaces`, `hasTrailingSpaces`, and `hasDanglingSpaces` field; and remove those whitespaces. */
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
        node.children[0].data.trim().length === 0)
    ) {
      return Object.assign({}, node, {
        children: [],
        hasDanglingSpaces: node.children.length !== 0,
        isDanglingSpaceSensitive: isDanglingSpaceSensitiveNode(node)
      });
    }

    return Object.assign({}, node, {
      children: node.children
        // extract whitespace nodes
        .reduce((newChildren, child) => {
          if (child.type !== "text") {
            return newChildren.concat(child);
          }

          const localChildren = [];

          const [_, leadingSpaces, text, trailingSpaces] = child.data.match(
            /^(\s*)([\s\S]*?)(\s*)$/
          );

          if (leadingSpaces) {
            localChildren.push({ type: TYPE_WHITESPACE });
          }

          if (text) {
            localChildren.push({
              type: "text",
              data: text,
              startIndex: child.startIndex + leadingSpaces.length,
              endIndex: child.endIndex - trailingSpaces.length
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
