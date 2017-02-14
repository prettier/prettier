"use strict";

const codeFrame = require("babel-code-frame");
const comments = require("./src/comments");
const version = require("./package.json").version;
const printAstToDoc = require("./src/printer").printAstToDoc;
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

function parse(text, opts) {
  const parseFunction = opts.parser === "flow"
    ? parser.parseWithFlow
    : parser.parseWithBabylon;

  try {
    return parseFunction(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
    }

    throw error;
  }
}

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text);
  }
  ast.tokens = [];
  opts.originalText = text.trimRight();
  return astComments;
}

function ensureAllCommentsPrinted(astComments) {
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

function format(text, opts) {
  const ast = parse(text, opts);
  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts);
  const str = printDocToString(doc, opts.printWidth, guessLineEnding(text));
  ensureAllCommentsPrinted(astComments);
  return str;
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
  version: version,
  __debug: {
    formatAST: function(ast, opts) {
      opts = normalizeOptions(opts);
      const doc = printAstToDoc(ast, opts);
      const str = printDocToString(doc, opts.printWidth);
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
      const ast = parse(text, opts);
      attachComments(text, ast, opts);
      const doc = printAstToDoc(ast, opts);
      return doc;
    },
    printDocToString: function(doc, opts) {
      opts = normalizeOptions(opts);
      const str = printDocToString(doc, opts.printWidth);
      return str;
    }
  }
};
