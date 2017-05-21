"use strict";

const traverse = require("babel-traverse").default;
const estraverse = require("estraverse");
const comments = require("./src/comments");
const version = require("./package.json").version;
const printAstToDoc = require("./src/printer").printAstToDoc;
const util = require("./src/util");
const printDocToString = require("./src/doc-printer").printDocToString;
const normalizeOptions = require("./src/options").normalize;
const parser = require("./src/parser");
const printDocToDebug = require("./src/doc-debug").printDocToDebug;

function guessLineEnding(text) {
  const index = text.indexOf("\n");
  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }
  return "\n";
}

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  ast.tokens = [];
  opts.originalText = text.trimRight();
  return astComments;
}

function ensureAllCommentsPrinted(astComments) {
  for (let i = 0; i < astComments.length; ++i) {
    if (astComments[i].value.trim() === "prettier-ignore") {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach(comment => {
    if (!comment.printed) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!'
      );
    }
    delete comment.printed;
  });
}

function format(text, opts, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;

  const ast = parser.parse(text, opts);

  const formattedRangeOnly = formatRange(text, opts, ast);
  if (formattedRangeOnly) {
    return formattedRangeOnly;
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(text);
  const str = printDocToString(doc, opts);
  ensureAllCommentsPrinted(astComments);
  // Remove extra leading newline as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    return str.slice(opts.newLine.length).trimRight() + opts.newLine;
  }
  return str;
}

function findNodeByOffset(ast, offset, opts, text) {
  let resultNode;
  if (opts.parser === "babylon") {
    traverse(ast, {
      enter: function(path) {
        const node = path.node;
        if (nodeContainsOffsetAndParses(node, offset, opts, text)) {
          resultNode = node;
        } else {
          return path.skip();
        }
      }
    });
  } else {
    estraverse.traverse(ast, {
      enter: function(node) {
        if (nodeContainsOffsetAndParses(node, offset, opts, text)) {
          resultNode = node;
        } else {
          return this.skip();
        }
      }
    });
  }
  return resultNode;
}

function nodeContainsOffsetAndParses(node, offset, opts, text) {
  const start = util.locStart(node);
  const end = util.locEnd(node);
  if (start <= offset && offset <= end) {
    try {
      parser.parse(text.slice(start, end), opts);
      return true;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

function extendRangeStart(text, opts, ast) {
  const startNode = findNodeByOffset(ast, opts.rangeStart, opts, text);
  const rangeStart = util.locStart(startNode);
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  return Math.min(rangeStart, text.lastIndexOf("\n", rangeStart) + 1);
}

function extendRangeEnd(text, opts, ast) {
  const endNode = findNodeByOffset(ast, opts.rangeEnd, opts, text);
  const rangeEnd = util.locEnd(endNode);
  // Use `text.length - 1` as the maximum since `indexOf` returns -1 if `fromIndex >= text.length`
  const fromIndex = Math.min(rangeEnd, text.length - 1);
  const nextNewLineIndex = text.indexOf("\n", fromIndex);
  return (nextNewLineIndex < 0 ? fromIndex : nextNewLineIndex) + 1; // Add one to make rangeEnd exclusive
}

function formatRange(text, opts, ast) {
  if (0 < opts.rangeStart || opts.rangeEnd < text.length) {
    const rangeStart = extendRangeStart(text, opts, ast);
    const rangeEnd = extendRangeEnd(text, opts, ast);

    const rangeString = text.substring(rangeStart, rangeEnd);
    const alignmentSize = util.getAlignmentSize(
      rangeString.slice(0, rangeString.search(/[^ \t]/)),
      opts.tabWidth
    );

    const rangeFormatted = format(
      rangeString,
      Object.assign({}, opts, {
        rangeStart: 0,
        rangeEnd: Infinity,
        printWidth: opts.printWidth - alignmentSize
      }),
      alignmentSize
    );

    return text.slice(0, rangeStart) + rangeFormatted + text.slice(rangeEnd);
  }
}

function formatWithShebang(text, opts) {
  if (!text.startsWith("#!")) {
    return format(text, opts);
  }

  const index = text.indexOf("\n");
  const shebang = text.slice(0, index + 1);
  const programText = text.slice(index + 1);
  const nextChar = text.charAt(index + 1);
  const newLine = nextChar === "\n" ? "\n" : nextChar === "\r" ? "\r\n" : "";

  return shebang + newLine + format(programText, opts);
}

module.exports = {
  format: function(text, opts) {
    return formatWithShebang(text, normalizeOptions(opts));
  },
  check: function(text, opts) {
    try {
      const formatted = formatWithShebang(text, normalizeOptions(opts));
      return formatted === text;
    } catch (e) {
      return false;
    }
  },
  version: version,
  __debug: {
    parse: function(text, opts) {
      return parser.parse(text, opts);
    },
    formatAST: function(ast, opts) {
      opts = normalizeOptions(opts);
      const doc = printAstToDoc(ast, opts);
      const str = printDocToString(doc, opts);
      return str;
    },
    // Doesn't handle shebang for now
    formatDoc: function(doc, opts) {
      opts = normalizeOptions(opts);
      const debug = printDocToDebug(doc);
      const str = format(debug, opts);
      return str;
    },
    printToDoc: function(text, opts) {
      opts = normalizeOptions(opts);
      const ast = parser.parse(text, opts);
      attachComments(text, ast, opts);
      const doc = printAstToDoc(ast, opts);
      return doc;
    },
    printDocToString: function(doc, opts) {
      opts = normalizeOptions(opts);
      const str = printDocToString(doc, opts);
      return str;
    }
  }
};
