"use strict";

const normalizeOptions = require("./options").normalize;
const massageAST = require("./massage-ast");
const comments = require("./comments");
const parser = require("./parser");
const printAstToDoc = require("./ast-to-doc");
const rangeUtil = require("./range-util");

const privateUtil = require("../common/util");

const doc = require("../doc");
const printDocToString = doc.printer.printDocToString;
const printDocToDebug = doc.debug.printDocToDebug;

const UTF8BOM = 0xfeff;

function guessLineEnding(text) {
  const index = text.indexOf("\n");
  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }
  return "\n";
}

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

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

function coreFormat(text, opts, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;

  const parsed = parser.parse(text, opts);
  const ast = parsed.ast;
  text = parsed.text;

  let cursorOffset;
  if (opts.cursorOffset >= 0) {
    const cursorNodeAndParents = rangeUtil.findNodeAtOffset(
      ast,
      opts.cursorOffset,
      opts
    );
    const cursorNode = cursorNodeAndParents.node;
    if (cursorNode) {
      cursorOffset = opts.cursorOffset - opts.locStart(cursorNode);
      opts.cursorNode = cursorNode;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(text);

  const result = printDocToString(doc, opts);
  const formatted = result.formatted;
  const cursorOffsetResult = result.cursor;
  ensureAllCommentsPrinted(astComments);
  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    return { formatted: formatted.trim() + opts.newLine };
  }

  if (cursorOffset !== undefined) {
    return {
      formatted,
      cursorOffset: cursorOffsetResult + cursorOffset
    };
  }

  return { formatted };
}

function formatRange(text, opts) {
  const parsed = parser.parse(text, opts);
  const ast = parsed.ast;
  text = parsed.text;

  const range = rangeUtil.calculateRange(text, opts, ast);
  const rangeStart = range.rangeStart;
  const rangeEnd = range.rangeEnd;
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1
  );
  const indentString = text.slice(rangeStart2, rangeStart);

  const alignmentSize = privateUtil.getAlignmentSize(
    indentString,
    opts.tabWidth
  );

  const rangeFormatted = coreFormat(
    rangeString,
    Object.assign({}, opts, {
      rangeStart: 0,
      rangeEnd: Infinity,
      printWidth: opts.printWidth - alignmentSize
    }),
    alignmentSize
  ).formatted;

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeFormatted.trimRight();

  return text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
}

function format(text, opts) {
  if (opts.rangeStart > 0 || opts.rangeEnd < text.length) {
    return { formatted: formatRange(text, opts) };
  }

  const selectedParser = parser.resolveParser(opts);
  const hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);
  if (opts.requirePragma && !hasPragma) {
    return { formatted: text };
  }

  const hasUnicodeBOM = text.charCodeAt(0) === UTF8BOM;
  if (hasUnicodeBOM) {
    text = text.substring(1);
  }

  if (opts.insertPragma && opts.printer.insertPragma && !hasPragma) {
    text = opts.printer.insertPragma(text);
  }

  const result = coreFormat(text, opts);
  if (hasUnicodeBOM) {
    result.formatted = String.fromCharCode(UTF8BOM) + result.formatted;
  }
  return result;
}

module.exports = {
  formatWithCursor(text, opts) {
    return format(text, normalizeOptions(opts));
  },

  parse(text, opts, massage) {
    opts = normalizeOptions(opts);
    const parsed = parser.parse(text, opts);
    if (massage) {
      parsed.ast = massageAST(parsed.ast, opts);
    }
    return parsed;
  },

  formatAST(ast, opts) {
    opts = normalizeOptions(opts);
    const doc = printAstToDoc(ast, opts);
    return printDocToString(doc, opts);
  },

  // Doesn't handle shebang for now
  formatDoc(doc, opts) {
    opts = normalizeOptions(opts);
    const debug = printDocToDebug(doc);
    return format(debug, opts).formatted;
  },

  printToDoc(text, opts) {
    opts = normalizeOptions(opts);
    const parsed = parser.parse(text, opts);
    const ast = parsed.ast;
    text = parsed.text;
    attachComments(text, ast, opts);
    return printAstToDoc(ast, opts);
  },

  printDocToString(doc, opts) {
    return printDocToString(doc, normalizeOptions(opts));
  }
};
