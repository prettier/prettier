"use strict";

var assert = require("assert");
var types = require("ast-types");
var n = types.namedTypes;

function comparePos(pos1, pos2) {
  return pos1.line - pos2.line || pos1.column - pos2.column;
}

function expandLoc(parentNode, childNode) {
  if (locStart(childNode) - locStart(parentNode) < 0) {
    setLocStart(parentNode, locStart(childNode));
  }

  if (locEnd(parentNode) - locEnd(childNode) < 0) {
    setLocEnd(parentNode, locEnd(childNode));
  }
}

function fixFaultyLocations(node, text) {
  if (node.decorators) {
    // Expand the loc of the node responsible for printing the decorators
    // (here, the decorated node) so that it includes node.decorators.
    node.decorators.forEach(function(decorator) {
      expandLoc(node, decorator);
    });
  } else if (node.declaration && isExportDeclaration(node)) {
    // Expand the loc of the node responsible for printing the decorators
    // (here, the export declaration) so that it includes node.decorators.
    var decorators = node.declaration.decorators;
    if (decorators) {
      decorators.forEach(function(decorator) {
        expandLoc(node, decorator);
      });
    }
  } else if (
    n.MethodDefinition && n.MethodDefinition.check(node) ||
    n.Property.check(node) && (node.method || node.shorthand)
  ) {
    if (n.FunctionExpression.check(node.value)) {
      // FunctionExpression method values should be anonymous,
      // because their .id fields are ignored anyway.
      node.value.id = null;
    }
  } else if (node.type === "ObjectTypeProperty") {
    var end = skipSpaces(text, locEnd(node), true);
    if (end !== false && text.charAt(end) === ",") {
      // Some parsers accidentally include trailing commas in the
      // end information for ObjectTypeProperty nodes.
      if ((end = skipSpaces(text, end - 1, true)) !== false) {
        setLocEnd(node, end);
      }
    }
  }
}

function isExportDeclaration(node) {
  if (node)
    switch (node.type) {
      case "ExportDeclaration":
      case "ExportDefaultDeclaration":
      case "ExportDefaultSpecifier":
      case "DeclareExportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportAllDeclaration":
        return true;
    }

  return false;
}

function getParentExportDeclaration(path) {
  var parentNode = path.getParentNode();
  if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
    return parentNode;
  }

  return null;
}

function getLast(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
}

function skip(chars) {
  return (text, index, opts) => {
    const backwards = opts && opts.backwards;

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    if (index === false) {
      return false;
    }

    const length = text.length;
    let cursor = index;
    while (cursor >= 0 && cursor < length) {
      const c = text.charAt(cursor);
      if (chars instanceof RegExp) {
        if (!chars.test(c)) {
          return cursor;
        }
      } else if (chars.indexOf(c) === -1) {
        return cursor;
      }

      backwards ? cursor-- : cursor++;
    }

    if (cursor === -1 || cursor === length) {
      // If we reached the beginning or end of the file, return the
      // out-of-bounds cursor. It's up to the caller to handle this
      // correctly. We don't want to indicate `false` though if it
      // actually skipped valid characters.
      return cursor;
    }
    return false;
  };
}

const skipWhitespace = skip(/\s/);
const skipSpaces = skip(" \t");
const skipToLineEnd = skip(",; \t");
const skipEverythingButNewLine = skip(/[^\r\n]/);

function skipInlineComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (var i = index + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return index;
}

function skipTrailingComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

// This one doesn't use the above helper function because it wants to
// test \r\n in order and `skip` doesn't support ordering and we only
// want to skip one newline. It's simple to implement.
function skipNewline(text, index, opts) {
  const backwards = opts && opts.backwards;
  if (index === false) {
    return false;
  } else if (backwards) {
    if (text.charAt(index) === "\n") {
      return index - 1;
    }
    if (text.charAt(index - 1) === "\r" && text.charAt(index) === "\n") {
      return index - 2;
    }
  } else {
    if (text.charAt(index) === "\n") {
      return index + 1;
    }
    if (text.charAt(index) === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }
  }

  return index;
}

function hasNewline(text, index, opts) {
  opts = opts || {};
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  const idx2 = skipNewline(text, idx, opts);
  return idx !== idx2;
}

function hasNewlineInRange(text, start, end) {
  for (var i = start; i < end; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }
  return false;
}

// Note: this function doesn't ignore leading comments unlike isNextLineEmpty
function isPreviousLineEmpty(text, node) {
  let idx = locStart(node) - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skipNewline(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  const idx2 = skipNewline(text, idx, { backwards: true });
  return idx !== idx2;
}

function isNextLineEmpty(text, node) {
  let oldIdx = null;
  let idx = locEnd(node);
  idx = skipToLineEnd(text, idx);
  while (idx !== oldIdx) {
    // We need to skip all the potential trailing inline comments
    oldIdx = idx;
    idx = skipInlineComment(text, idx);
    idx = skipSpaces(text, idx);
  }
  idx = skipTrailingComment(text, idx);
  idx = skipNewline(text, idx);
  return hasNewline(text, idx);
}

function hasSpaces(text, index, opts) {
  opts = opts || {};
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  return idx !== index;
}

function locStart(node) {
  if (node.range) {
    return node.range[0];
  }
  return node.start;
}

function locEnd(node) {
  if (node.range) {
    return node.range[1];
  }
  return node.end;
}

function setLocStart(node, index) {
  if (node.range) {
    node.range[0] = index;
  } else {
    node.start = index;
  }
}

function setLocEnd(node, index) {
  if (node.range) {
    node.range[1] = index;
  } else {
    node.end = index;
  }
}

// http://stackoverflow.com/a/7124052
function htmlEscapeInsideDoubleQuote(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  // Intentionally disable the following since it is safe inside of a
  // double quote context
  //    .replace(/'/g, '&#39;')
  //    .replace(/</g, '&lt;')
  //    .replace(/>/g, '&gt;');
}

// http://stackoverflow.com/a/7124052
function htmlEscapeInsideAngleBracket(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Intentionally disable the following since it is safe inside of a
  // angle bracket context
  //    .replace(/&/g, '&amp;')
  //    .replace(/"/g, '&quot;')
  //    .replace(/'/g, '&#39;')
}

var PRECEDENCE = {};
[
  ["||"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "===", "!=", "!=="],
  ["<", ">", "<=", ">=", "in", "instanceof"],
  [">>", "<<", ">>>"],
  ["+", "-"],
  ["*", "/", "%", "**"]
].forEach(function(tier, i) {
  tier.forEach(function(op) {
    PRECEDENCE[op] = i;
  });
});

function getPrecedence(op) {
  return PRECEDENCE[op];
}

module.exports = {
  comparePos,
  getPrecedence,
  fixFaultyLocations,
  isExportDeclaration,
  getParentExportDeclaration,
  getLast,
  skipWhitespace,
  skipSpaces,
  skipNewline,
  isNextLineEmpty,
  isPreviousLineEmpty,
  hasNewline,
  hasNewlineInRange,
  hasSpaces,
  locStart,
  locEnd,
  setLocStart,
  setLocEnd,
  htmlEscapeInsideDoubleQuote,
  htmlEscapeInsideAngleBracket
};
