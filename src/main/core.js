// Use `diff/lib/diff/array.js` instead of `diff` to reduce bundle size
import { diffArrays } from "diff/lib/diff/array.js";

import {
  convertEndOfLineToChars,
  countEndOfLineChars,
  guessEndOfLine,
  normalizeEndOfLine,
} from "../common/end-of-line.js";
import { addAlignmentToDoc, hardline } from "../document/builders.js";
import { printDocToDebug } from "../document/debug.js";
import { printDocToString as printDocToStringWithoutNormalizeOptions } from "../document/printer.js";
import getAlignmentSize from "../utils/get-alignment-size.js";
import { prepareToPrint, printAstToDoc } from "./ast-to-doc.js";
import getCursorNode from "./get-cursor-node.js";
import massageAst from "./massage-ast.js";
import normalizeFormatOptions from "./normalize-format-options.js";
import parseText from "./parse.js";
import { resolveParser } from "./parser-and-printer.js";
import { calculateRange } from "./range-util.js";

const BOM = "\uFEFF";

const CURSOR = Symbol("cursor");

async function coreFormat(originalText, opts, addAlignmentSize = 0) {
  if (!originalText || originalText.trim().length === 0) {
    return { formatted: "", cursorOffset: -1, comments: [] };
  }

  const { ast, text } = await parseText(originalText, opts);

  if (opts.cursorOffset >= 0) {
    opts.cursorNode = getCursorNode(ast, opts);
  }

  let doc = await printAstToDoc(ast, opts, addAlignmentSize);

  if (addAlignmentSize > 0) {
    // Add a hardline to make the indents take effect, it will be removed later
    doc = addAlignmentToDoc([hardline, doc], addAlignmentSize, opts.tabWidth);
  }

  const result = printDocToStringWithoutNormalizeOptions(doc, opts);

  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    const trimmed = result.formatted.trim();

    if (result.cursorNodeStart !== undefined) {
      result.cursorNodeStart -= result.formatted.indexOf(trimmed);
    }

    result.formatted = trimmed + convertEndOfLineToChars(opts.endOfLine);
  }

  const comments = opts[Symbol.for("comments")];

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
        opts.locEnd(opts.cursorNode),
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
        comments,
      };
    }

    // diff old and new cursor node texts, with a special cursor
    // symbol inserted to find out where it moves to

    // eslint-disable-next-line unicorn/prefer-spread
    const oldCursorNodeCharArray = oldCursorNodeText.split("");
    oldCursorNodeCharArray.splice(
      cursorOffsetRelativeToOldCursorNode,
      0,
      CURSOR,
    );

    // eslint-disable-next-line unicorn/prefer-spread
    const newCursorNodeCharArray = newCursorNodeText.split("");

    const cursorNodeDiff = diffArrays(
      oldCursorNodeCharArray,
      newCursorNodeCharArray,
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

    return { formatted: result.formatted, cursorOffset, comments };
  }

  return { formatted: result.formatted, cursorOffset: -1, comments };
}

async function formatRange(originalText, opts) {
  const { ast, text } = await parseText(originalText, opts);
  const { rangeStart, rangeEnd } = calculateRange(text, opts, ast);
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1,
  );
  const indentString = text.slice(rangeStart2, rangeStart).match(/^\s*/)[0];

  const alignmentSize = getAlignmentSize(indentString, opts.tabWidth);

  const rangeResult = await coreFormat(
    rangeString,
    {
      ...opts,
      rangeStart: 0,
      rangeEnd: Number.POSITIVE_INFINITY,
      // Track the cursor offset only if it's within our range
      cursorOffset:
        opts.cursorOffset > rangeStart && opts.cursorOffset <= rangeEnd
          ? opts.cursorOffset - rangeStart
          : -1,
      // Always use `lf` to format, we'll replace it later
      endOfLine: "lf",
    },
    alignmentSize,
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeResult.formatted.trimEnd();

  let { cursorOffset } = opts;
  if (cursorOffset > rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset += rangeTrimmed.length - rangeString.length;
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
        "\n",
      );
    }

    formatted = formatted.replaceAll("\n", eol);
  }

  return { formatted, cursorOffset, comments: rangeResult.comments };
}

function ensureIndexInText(text, index, defaultValue) {
  if (
    typeof index !== "number" ||
    Number.isNaN(index) ||
    index < 0 ||
    index > text.length
  ) {
    return defaultValue;
  }

  return index;
}

function normalizeIndexes(text, options) {
  let { cursorOffset, rangeStart, rangeEnd } = options;
  cursorOffset = ensureIndexInText(text, cursorOffset, -1);
  rangeStart = ensureIndexInText(text, rangeStart, 0);
  rangeEnd = ensureIndexInText(text, rangeEnd, text.length);

  return { ...options, cursorOffset, rangeStart, rangeEnd };
}

function normalizeInputAndOptions(text, options) {
  let { cursorOffset, rangeStart, rangeEnd, endOfLine } = normalizeIndexes(
    text,
    options,
  );

  const hasBOM = text.charAt(0) === BOM;

  if (hasBOM) {
    text = text.slice(1);
    cursorOffset--;
    rangeStart--;
    rangeEnd--;
  }

  if (endOfLine === "auto") {
    endOfLine = guessEndOfLine(text);
  }

  // get rid of CR/CRLF parsing
  if (text.includes("\r")) {
    const countCrlfBefore = (index) =>
      countEndOfLineChars(text.slice(0, Math.max(index, 0)), "\r\n");

    cursorOffset -= countCrlfBefore(cursorOffset);
    rangeStart -= countCrlfBefore(rangeStart);
    rangeEnd -= countCrlfBefore(rangeEnd);

    text = normalizeEndOfLine(text);
  }

  return {
    hasBOM,
    text,
    options: normalizeIndexes(text, {
      ...options,
      cursorOffset,
      rangeStart,
      rangeEnd,
      endOfLine,
    }),
  };
}

async function hasPragma(text, options) {
  const selectedParser = await resolveParser(options);
  return !selectedParser.hasPragma || selectedParser.hasPragma(text);
}

async function formatWithCursor(originalText, originalOptions) {
  let { hasBOM, text, options } = normalizeInputAndOptions(
    originalText,
    await normalizeFormatOptions(originalOptions),
  );

  if (
    (options.rangeStart >= options.rangeEnd && text !== "") ||
    (options.requirePragma && !(await hasPragma(text, options)))
  ) {
    return {
      formatted: originalText,
      cursorOffset: originalOptions.cursorOffset,
      comments: [],
    };
  }

  let result;

  if (options.rangeStart > 0 || options.rangeEnd < text.length) {
    result = await formatRange(text, options);
  } else {
    if (
      !options.requirePragma &&
      options.insertPragma &&
      options.printer.insertPragma &&
      !(await hasPragma(text, options))
    ) {
      text = options.printer.insertPragma(text);
    }
    result = await coreFormat(text, options);
  }

  if (hasBOM) {
    result.formatted = BOM + result.formatted;

    if (result.cursorOffset >= 0) {
      result.cursorOffset++;
    }
  }

  return result;
}

async function parse(originalText, originalOptions, devOptions) {
  const { text, options } = normalizeInputAndOptions(
    originalText,
    await normalizeFormatOptions(originalOptions),
  );
  const parsed = await parseText(text, options);
  if (devOptions) {
    if (devOptions.preprocessForPrint) {
      parsed.ast = await prepareToPrint(parsed.ast, options);
    }
    if (devOptions.massage) {
      parsed.ast = massageAst(parsed.ast, options);
    }
  }
  return parsed;
}

async function formatAst(ast, options) {
  options = await normalizeFormatOptions(options);
  const doc = await printAstToDoc(ast, options);
  return printDocToStringWithoutNormalizeOptions(doc, options);
}

// Doesn't handle shebang for now
async function formatDoc(doc, options) {
  const text = printDocToDebug(doc);
  const { formatted } = await formatWithCursor(text, {
    ...options,
    parser: "__js_expression",
  });

  return formatted;
}

async function printToDoc(originalText, options) {
  options = await normalizeFormatOptions(options);
  const { ast } = await parseText(originalText, options);
  return printAstToDoc(ast, options);
}

async function printDocToString(doc, options) {
  return printDocToStringWithoutNormalizeOptions(
    doc,
    await normalizeFormatOptions(options),
  );
}

export {
  formatAst,
  formatDoc,
  formatWithCursor,
  parse,
  printDocToString,
  printToDoc,
};
