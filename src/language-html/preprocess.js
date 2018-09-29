"use strict";

const {
  VOID_TAGS,
  isScriptLikeTag,
  isWhitespaceSensitiveTag,
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
    if (!node.children || isWhitespaceSensitiveTag(node)) {
      return node;
    }

    if (node.type === "yaml" || node.type === "toml") {
      return Object.assign({}, node, {
        hasLeadingSpaces: true,
        hasTrailingSpaces: true
      });
    }

    if (
      node.children.length === 1 &&
      node.children[0].type === "text" &&
      node.children[0].data.trim().length === 0
    ) {
      return Object.assign({}, node, { hasDanglingSpaces: true, children: [] });
    }

    const childrenWithWhitespaces = [];
    for (const child of node.children) {
      if (child.type !== "text") {
        childrenWithWhitespaces.push(child);
        continue;
      }

      const [_, leadingSpaces, text, trailingSpaces] = child.data.match(
        /^(\s*)([\s\S]*?)(\s*)$/
      );

      if (leadingSpaces) {
        childrenWithWhitespaces.push({ type: TYPE_WHITESPACE });
      }

      if (text) {
        childrenWithWhitespaces.push({
          type: "text",
          data: text,
          startIndex: child.startIndex + leadingSpaces.length,
          endIndex: child.endIndex - trailingSpaces.length
        });
      }

      if (trailingSpaces) {
        childrenWithWhitespaces.push({ type: TYPE_WHITESPACE });
      }
    }

    const isScriptLike = isScriptLikeTag(node);

    const children = [];
    for (let i = 0; i < childrenWithWhitespaces.length; i++) {
      const child = childrenWithWhitespaces[i];

      if (child.type === TYPE_WHITESPACE) {
        continue;
      }

      const hasLeadingSpaces =
        isScriptLike ||
        (i !== 0 && childrenWithWhitespaces[i - 1].type === TYPE_WHITESPACE);

      const hasTrailingSpaces =
        isScriptLike ||
        (i !== childrenWithWhitespaces.length - 1 &&
          childrenWithWhitespaces[i + 1].type === TYPE_WHITESPACE);

      children.push(
        Object.assign({}, child, { hasLeadingSpaces, hasTrailingSpaces })
      );
    }

    return Object.assign({}, node, { children });
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
