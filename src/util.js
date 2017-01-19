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
};

function isExportDeclaration(node) {
  if (node) switch (node.type) {
      case "ExportDeclaration":
      case "ExportDefaultDeclaration":
      case "ExportDefaultSpecifier":
      case "DeclareExportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportAllDeclaration":
        return true;
    }

  return false;
};

function getParentExportDeclaration(path) {
  var parentNode = path.getParentNode();
  if (
    path.getName() === "declaration" && isExportDeclaration(parentNode)
  ) {
    return parentNode;
  }

  return null;
};

function getLast(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
};

function skipNewLineForward(text, index) {
  // What the "end" location points to is not consistent in parsers.
  // For some statement/expressions, it's the character immediately
  // afterward. For others, it's the last character in it. We need to
  // scan until we hit a newline in order to skip it.
  while (index < text.length) {
    if (text.charAt(index) === "\n") {
      return index + 1;
    }
    if (text.charAt(index) === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }
    index++;
  }
  return index;
}

function findNewline(text, index, backwards) {
  const length = text.length;
  let cursor = backwards ? index - 1 : skipNewLineForward(text, index);
  // Look forward and see if there is a newline after/before this code
  // by scanning up/back to the next non-indentation character.
  while (cursor > 0 && cursor < length) {
    const c = text.charAt(cursor);
    // Skip any indentation characters
    if (c !== " " && c !== "\t") {
      // Check if the next non-indentation character is a newline or
      // not.
      return c === "\n" || c === "\r";
    }
    backwards ? cursor-- : cursor++;
  }
  return false;
}

function newlineExistsBefore(text, index) {
  return findNewline(text, index, true);
};

function newlineExistsAfter(text, index) {
  return findNewline(text, index);
};

function skipSpaces(text, index, backwards) {
  const length = text.length;
  let cursor = backwards ? index - 1 : index;
  // Look forward and see if there is a newline after/before this code
  // by scanning up/back to the next non-indentation character.
  while (cursor > 0 && cursor < length) {
    const c = text.charAt(cursor);
    // Skip any whitespace chars
    if (!c.match(/\S/)) {
      return cursor;
    }
    backwards ? cursor-- : cursor++;
  }
  return false;
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
  [ "||" ],
  [ "&&" ],
  [ "|" ],
  [ "^" ],
  [ "&" ],
  [ "==", "===", "!=", "!==" ],
  [ "<", ">", "<=", ">=", "in", "instanceof" ],
  [ ">>", "<<", ">>>" ],
  [ "+", "-" ],
  [ "*", "/", "%", "**" ]
].forEach(function(tier, i) {
  tier.forEach(function(op) {
    PRECEDENCE[op] = i;
  });
});

function getPrecedence(op) {
  return PRECEDENCE[op];
};

module.exports = {
  comparePos,
  getPrecedence,
  fixFaultyLocations,
  isExportDeclaration,
  getParentExportDeclaration,
  getLast,
  newlineExistsBefore,
  newlineExistsAfter,
  skipSpaces,
  locStart,
  locEnd,
  setLocStart,
  setLocEnd,
  htmlEscapeInsideDoubleQuote,
  htmlEscapeInsideAngleBracket
};
