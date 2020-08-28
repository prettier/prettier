"use strict";

const diff = require("diff");

const {
  printer: { printDocToString },
  debug: { printDocToDebug },
} = require("../document");
const { getAlignmentSize } = require("../common/util");
const {
  guessEndOfLine,
  convertEndOfLineToChars,
  countEndOfLineChars,
  normalizeEndOfLine,
} = require("../common/end-of-line");
const normalizeOptions = require("./options").normalize;
const massageAST = require("./massage-ast");
const comments = require("./comments");
const parser = require("./parser");
const printAstToDoc = require("./ast-to-doc");
const rangeUtil = require("./range-util");

const BOM = "\uFEFF";

const CURSOR = Symbol("cursor");

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  opts[Symbol.for("comments")] = astComments || [];
  opts[Symbol.for("tokens")] = ast.tokens || [];
  opts.originalText = text;
  return astComments;
}

function coreFormat(text, opts, addAlignmentSize) {
  if (!text || !text.trim().length) {
    return { formatted: "", cursorOffset: -1 };
  }

  addAlignmentSize = addAlignmentSize || 0;

  const parsed = parser.parse(text, opts);
  const { ast } = parsed;
  text = parsed.text;

  if (opts.cursorOffset >= 0) {
    const nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);
    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);

  const result = printDocToString(doc, opts);

  comments.ensureAllCommentsPrinted(astComments);
  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    const trimmed = result.formatted.trim();

    if (result.cursorNodeStart !== undefined) {
      result.cursorNodeStart -= result.formatted.indexOf(trimmed);
    }

    result.formatted = trimmed + convertEndOfLineToChars(opts.endOfLine);
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
        cursorOffset: newCursorNodeStart + cursorOffsetRelativeToOldCursorNode,
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
        if (entry.value.includes(CURSOR)) {
          break;
        }
      } else {
        cursorOffset += entry.count;
      }
    }

    return { formatted: result.formatted, cursorOffset };
  }

  return { formatted: result.formatted, cursorOffset: -1 };
}

function formatRange(text, opts) {
  const parsed = parser.parse(text, opts);
  const { ast } = parsed;
  text = parsed.text;

  const { rangeStart, rangeEnd } = rangeUtil.calculateRange(text, opts, ast);
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1
  );
  const indentString = text.slice(rangeStart2, rangeStart).match(/^\s*/)[0];

  const alignmentSize = getAlignmentSize(indentString, opts.tabWidth);

  const rangeResult = coreFormat(
    rangeString,
    {
      ...opts,
      rangeStart: 0,
      rangeEnd: Infinity,
      // Track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset > rangeStart && opts.cursorOffset < rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1,
      // Always use `lf` to format, we'll replace it later
      endOfLine: "lf",
    },
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimEnd();

  let { cursorOffset } = opts;
  if (cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset =
      opts.cursorOffset + (rangeTrimmed.length - rangeString.length);
  } else if (rangeResult.cursorOffset >= 0) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  }
  // keep the cursor as it was if it was before the start of the range

  let formatted =
    text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
  if (opts.endOfLine !== "lf") {
    const eol = convertEndOfLineToChars(opts.endOfLine);
    if (cursorOffset >= 0 && eol === "\r\n") {
      cursorOffset += countEndOfLineChars(
        formatted.slice(0, cursorOffset),
        "\n"
      );
    }

    formatted = formatted.replace(/\n/g, eol);
  }

  return { formatted, cursorOffset };
}

function format(originalText, opts) {
  const selectedParser = parser.resolveParser(opts);

  const hasBOM = originalText.charAt(0) === BOM;
  let text = hasBOM ? originalText.slice(1) : originalText;

  const hasCursor = opts.cursorOffset >= 0;
  if (!hasCursor) {
    opts.cursorOffset = -1;
  }

  const hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);
  if (opts.requirePragma && !hasPragma) {
    return { formatted: originalText, cursorOffset: opts.cursorOffset };
  }

  if (opts.endOfLine === "auto") {
    opts.endOfLine = guessEndOfLine(text);
  }

  const hasRangeStart = opts.rangeStart > 0;
  const hasRangeEnd = opts.rangeEnd < text.length;

  if (hasBOM) {
    if (hasCursor) {
      opts.cursorOffset--;
    }
    if (hasRangeStart) {
      opts.rangeStart--;
    }
    if (hasRangeEnd) {
      opts.rangeEnd--;
    }
  }

  // get rid of CR/CRLF parsing
  if (text.includes("\r")) {
    const countCrlfBefore = (position) =>
      countEndOfLineChars(text.slice(0, position), "\r\n");
    if (hasCursor) {
      opts.cursorOffset -= countCrlfBefore(opts.cursorOffset);
    }
    if (hasRangeStart) {
      opts.rangeStart -= countCrlfBefore(opts.rangeStart);
    }
    if (hasRangeEnd) {
      opts.rangeEnd -= countCrlfBefore(opts.rangeEnd);
    }

    text = normalizeEndOfLine(text);
  }

  if (opts.rangeStart < 0) {
    opts.rangeStart = 0;
  }
  if (opts.rangeEnd > text.length) {
    opts.rangeEnd = text.length;
  }

  let result;

  if (hasRangeStart || hasRangeEnd) {
    result = formatRange(text, opts);
  } else {
    if (!hasPragma && opts.insertPragma && opts.printer.insertPragma) {
      text = opts.printer.insertPragma(text);
    }
    result = coreFormat(text, opts);
  }

  if (hasBOM) {
    result.formatted = BOM + result.formatted;

    if (hasCursor && result.cursorOffset >= 0) {
      result.cursorOffset++;
    }
  }

  return result;
}

module.exports = {
  formatWithCursor(text, opts) {
    opts = normalizeOptions(opts);
    return format(text, opts);
  },

  parse(text, opts, massage) {
    opts = normalizeOptions(opts);
    text = normalizeEndOfLine(text.charAt(0) === BOM ? text.slice(1) : text);
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
    opts = normalizeOptions({ ...opts, parser: "babel" });
    const debug = printDocToDebug(doc);
    return format(debug, opts).formatted;
  },

  printToDoc(originalText, opts) {
    opts = normalizeOptions(opts);
    const parsed = parser.parse(originalText, opts);
    const { ast, text } = parsed;
    attachComments(text, ast, opts);
    return printAstToDoc(ast, opts);
  },

  printDocToString(doc, opts) {
    return printDocToString(doc, normalizeOptions(opts));
  },
};
