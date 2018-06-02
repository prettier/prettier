"use strict";

const diff = require("diff");

const normalizeOptions = require("./options").normalize;
const massageAST = require("./massage-ast");
const comments = require("./comments");
const parser = require("./parser");
const printAstToDoc = require("./ast-to-doc");
const rangeUtil = require("./range-util");
const privateUtil = require("../common/util");
const {
  printer: { printDocToString },
  debug: { printDocToDebug }
} = require("../doc");

const UTF8BOM = 0xfeff;

const CURSOR = Symbol("cursor");

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

  if (opts.cursorOffset >= 0) {
    const nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);
    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(text);

  const result = printDocToString(doc, opts);

  ensureAllCommentsPrinted(astComments);
  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    const trimmed = result.formatted.trim();

    if (result.cursorNodeStart !== undefined) {
      result.cursorNodeStart -= result.formatted.indexOf(trimmed);
    }

    result.formatted = trimmed + opts.newLine;
  }

  if (opts.cursorOffset >= 0) {
    let oldCursorNodeStart;
    let oldCursorNodeText;

    let cursorOffsetRelativeToOldCursorNode;

    let newCursorNodeStart;
    let newCursorNodeText;

    if (opts.cursorNode && result.cursorNodeText) {
      oldCursorNodeStart = opts.locStart(opts.cursorNode);
      oldCursorNodeText = text.slice(
        oldCursorNodeStart,
        opts.locEnd(opts.cursorNode)
      );

      cursorOffsetRelativeToOldCursorNode =
        opts.cursorOffset - oldCursorNodeStart;

      newCursorNodeStart = result.cursorNodeStart;
      newCursorNodeText = result.cursorNodeText;
    } else {
      oldCursorNodeStart = 0;
      oldCursorNodeText = text;

      cursorOffsetRelativeToOldCursorNode = opts.cursorOffset;

      newCursorNodeStart = 0;
      newCursorNodeText = result.formatted;
    }

    if (oldCursorNodeText === newCursorNodeText) {
      return {
        formatted: result.formatted,
        cursorOffset: newCursorNodeStart + cursorOffsetRelativeToOldCursorNode
      };
    }

    // diff old and new cursor node texts, with a special cursor
    // symbol inserted to find out where it moves to

    const oldCursorNodeCharArray = oldCursorNodeText.split("");
    oldCursorNodeCharArray.splice(
      cursorOffsetRelativeToOldCursorNode,
      0,
      CURSOR
    );

    const newCursorNodeCharArray = newCursorNodeText.split("");

    const cursorNodeDiff = diff.diffArrays(
      oldCursorNodeCharArray,
      newCursorNodeCharArray
    );

    let cursorOffset = newCursorNodeStart;
    for (const entry of cursorNodeDiff) {
      if (entry.removed) {
        if (entry.value.indexOf(CURSOR) > -1) {
          break;
        }
      } else {
        cursorOffset += entry.count;
      }
    }

    return { formatted: result.formatted, cursorOffset };
  }

  return { formatted: result.formatted };
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

  const rangeResult = coreFormat(
    rangeString,
    Object.assign({}, opts, {
      rangeStart: 0,
      rangeEnd: Infinity,
      printWidth: opts.printWidth - alignmentSize,
      // track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset >= rangeStart && opts.cursorOffset < rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1
    }),
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimRight();
  const formatted =
    text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);

  let cursorOffset = opts.cursorOffset;
  if (opts.cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset =
      opts.cursorOffset - rangeEnd + (rangeStart + rangeTrimmed.length);
  } else if (rangeResult.cursorOffset !== undefined) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  }
  // keep the cursor as it was if it was before the start of the range

  return { formatted, cursorOffset };
}

function format(text, opts) {
  const selectedParser = parser.resolveParser(opts);
  const hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);
  if (opts.requirePragma && !hasPragma) {
    return { formatted: text };
  }

  if (opts.rangeStart > 0 || opts.rangeEnd < text.length) {
    return formatRange(text, opts);
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
    opts = normalizeOptions(opts);
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
    const debug = printDocToDebug(doc);
    opts = normalizeOptions(Object.assign({}, opts, { parser: "babylon" }));
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
