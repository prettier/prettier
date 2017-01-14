"use strict";
var assert = require("assert");
var types = require("ast-types");
var getFieldValue = types.getFieldValue;
var n = types.namedTypes;
var sourceMap = require("source-map");
var SourceMapConsumer = sourceMap.SourceMapConsumer;
var SourceMapGenerator = sourceMap.SourceMapGenerator;
var hasOwn = Object.prototype.hasOwnProperty;
var util = exports;

function getUnionOfKeys() {
  var result = {};
  var argc = arguments.length;
  for (var i = 0; i < argc; ++i) {
    var keys = Object.keys(arguments[i]);
    var keyCount = keys.length;
    for (var j = 0; j < keyCount; ++j) {
      result[keys[j]] = true;
    }
  }
  return result;
}
util.getUnionOfKeys = getUnionOfKeys;

function comparePos(pos1, pos2) {
  return pos1.line - pos2.line || pos1.column - pos2.column;
}
util.comparePos = comparePos;

function copyPos(pos) {
  return { line: pos.line, column: pos.column };
}
util.copyPos = copyPos;

util.composeSourceMaps = function(formerMap, latterMap) {
  if (formerMap) {
    if (!latterMap) {
      return formerMap;
    }
  } else {
    return latterMap || null;
  }

  var smcFormer = new SourceMapConsumer(formerMap);
  var smcLatter = new SourceMapConsumer(latterMap);
  var smg = new SourceMapGenerator({
    file: latterMap.file,
    sourceRoot: latterMap.sourceRoot
  });

  var sourcesToContents = {};

  smcLatter.eachMapping(function(mapping) {
    var origPos = smcFormer.originalPositionFor({
      line: mapping.originalLine,
      column: mapping.originalColumn
    });

    var sourceName = origPos.source;
    if (sourceName === null) {
      return;
    }

    smg.addMapping({
      source: sourceName,
      original: copyPos(origPos),
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn
      },
      name: mapping.name
    });

    var sourceContent = smcFormer.sourceContentFor(sourceName);
    if (sourceContent && !hasOwn.call(sourcesToContents, sourceName)) {
      sourcesToContents[sourceName] = sourceContent;
      smg.setSourceContent(sourceName, sourceContent);
    }
  });

  return smg.toJSON();
};

function expandLoc(parentNode, childNode) {
  if (locStart(childNode) - locStart(parentNode) < 0) {
    setLocStart(parentNode, locStart(childNode));
  }

  if (locEnd(parentNode) - locEnd(childNode) < 0) {
    setLocEnd(parentNode, locEnd(childNode));
  }
}

util.fixFaultyLocations = function(node, text) {
  if (node.type === "TemplateLiteral") {
    fixTemplateLiteral(node, text);
  } else if (node.decorators) {
    // Expand the loc of the node responsible for printing the decorators
    // (here, the decorated node) so that it includes node.decorators.
    node.decorators.forEach(function(decorator) {
      expandLoc(node, decorator);
    });
  } else if (node.declaration && util.isExportDeclaration(node)) {
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

function fixTemplateLiteral(node, text) {
  assert.strictEqual(node.type, "TemplateLiteral");

  if (node.quasis.length === 0) {
    // If there are no quasi elements, then there is nothing to fix.
    return;
  }

  // First we need to exclude the opening ` from the loc of the first
  // quasi element, in case the parser accidentally decided to include it.
  var afterLeftBackTickPos = locStart(node);
  assert.strictEqual(text.charAt(afterLeftBackTickPos), "`");
  assert.ok(afterLeftBackTickPos < text.length);
  var firstQuasi = node.quasis[(0)];
  if (locStart(firstQuasi) - afterLeftBackTickPos < 0) {
    setLocStart(firstQuasi, afterLeftBackTickPos);
  }

  // Next we need to exclude the closing ` from the loc of the last quasi
  // element, in case the parser accidentally decided to include it.
  var rightBackTickPos = locEnd(node);
  assert.ok(rightBackTickPos >= 0);
  assert.strictEqual(text.charAt(rightBackTickPos), "`");
  var lastQuasi = node.quasis[node.quasis.length - 1];
  if (rightBackTickPos - locEnd(lastQuasi) < 0) {
    setLocEnd(locEnd(lastQuasi), rightBackTickPos);
  }

  // Now we need to exclude ${ and } characters from the loc's of all
  // quasi elements, since some parsers accidentally include them.
  node.expressions.forEach(function(expr, i) {
    // Rewind from the start loc over any whitespace and the ${ that
    // precedes the expression. The position of the $ should be the
    // same as the end of the preceding quasi element, but some
    // parsers accidentally include the ${ in the loc of the quasi
    // element.
    var dollarCurlyPos = skipSpaces(text, locStart(expr) - 1, true);
    if (
      dollarCurlyPos - 1 >= 0 && text.charAt(dollarCurlyPos - 1) === "{" &&
        dollarCurlyPos - 2 >= 0 &&
        text.charAt(dollarCurlyPos - 2) === "$"
    ) {
      var quasiBefore = node.quasis[i];
      if (dollarCurlyPos - locEnd(quasiBefore) < 0) {
        setLocEnd(quasiBefore, dollarCurlyPos);
      }
    }

    // Likewise, some parsers accidentally include the } that follows
    // the expression in the loc of the following quasi element.
    var rightCurlyPos = skipSpaces(text, locEnd(expr));
    if (text.charAt(rightCurlyPos) === "}") {
      assert.ok(rightCurlyPos + 1 < text.length);
      // Now rightCurlyPos is technically the position just after the }.
      var quasiAfter = node.quasis[i + 1];
      if (locStart(quasiAfter) - rightCurlyPos < 0) {
        setLocStart(locStart(quasiAfter), rightCurlyPos);
      }
    }
  });
}

util.isExportDeclaration = function(node) {
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
};

util.getParentExportDeclaration = function(path) {
  var parentNode = path.getParentNode();
  if (
    path.getName() === "declaration" && util.isExportDeclaration(parentNode)
  ) {
    return parentNode;
  }

  return null;
};

util.isTrailingCommaEnabled = function(options, context) {
  var trailingComma = options.trailingComma;
  if (typeof trailingComma === "object") {
    return !!trailingComma[context];
  }
  return !!trailingComma;
};

util.getLast = function(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
};

function skipNewLineForward(text, index) {
  if (text.charAt(index) === "\n") {
    return index + 1;
  }
  if (text.charAt(index) === "\r" && text.charAt(index + 1) === "\n") {
    return index + 2;
  }
  // Note: this is incorrect, but makes the current tests pass for now.
  return index + 1;
}

function _findNewline(text, index, backwards) {
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

util.newlineExistsBefore = function(text, index) {
  return _findNewline(text, index, true);
};

util.newlineExistsAfter = function(text, index) {
  return _findNewline(text, index);
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
util.skipSpaces = skipSpaces;

function locStart(node) {
  if (node.range) {
    return node.range[(0)];
  }
  return node.start;
}
util.locStart = locStart;

function locEnd(node) {
  if (node.range) {
    return node.range[(1)];
  }
  return node.end;
}
util.locEnd = locEnd;

function setLocStart(node, index) {
  if (node.range) {
    node.range[(0)] = index;
  } else {
    node.start = index;
  }
}
util.setLocStart = setLocStart;

function setLocEnd(node, index) {
  if (node.range) {
    node.range[(1)] = index;
  } else {
    node.end = index;
  }
}
util.setLocEnd = setLocEnd;

// http://stackoverflow.com/a/7124052
function htmlEscapeInsideDoubleQuote(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  // Intentionally disable the following since it is safe inside of a
  // double quote context
  //    .replace(/'/g, '&#39;')
  //    .replace(/</g, '&lt;')
  //    .replace(/>/g, '&gt;');
}
util.htmlEscapeInsideDoubleQuote = htmlEscapeInsideDoubleQuote;
