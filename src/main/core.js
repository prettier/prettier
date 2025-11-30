import { diffArrays } from "diff";
import {
  convertEndOfLineToChars,
  countEndOfLineChars,
  guessEndOfLine,
  normalizeEndOfLine,
} from "../common/end-of-line.js";
import {
  addAlignmentToDoc,
  hardline,
  printDocToDebug,
  printDocToString as printDocToStringWithoutNormalizeOptions,
} from "../document/index.js";
import getAlignmentSize from "../utilities/get-alignment-size.js";
import { prepareToPrint, printAstToDoc } from "./ast-to-doc.js";
import getCursorLocation from "./get-cursor-node.js";
import massageAst from "./massage-ast.js";
import normalizeFormatOptions from "./normalize-format-options.js";
import parseText from "./parse.js";
import { resolveParser } from "./parser-and-printer.js";
import { calculateRange } from "./range.js";

const BOM = "\uFEFF";

const CURSOR = Symbol("cursor");

async function coreFormat(originalText, opts, addAlignmentSize = 0) {
  if (!originalText || originalText.trim().length === 0) {
    return { formatted: "", cursorOffset: -1, comments: [] };
  }

  const { ast, text } = await parseText(originalText, opts);

  if (opts.cursorOffset >= 0) {
    opts = {
      ...opts,
      ...getCursorLocation(ast, opts),
    };
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
      if (result.cursorNodeStart < 0) {
        result.cursorNodeStart = 0;
        result.cursorNodeText = result.cursorNodeText.trimStart();
      }
      if (
        result.cursorNodeStart + result.cursorNodeText.length >
        trimmed.length
      ) {
        result.cursorNodeText = result.cursorNodeText.trimEnd();
      }
    }

    result.formatted = trimmed + convertEndOfLineToChars(opts.endOfLine);
  }

  const comments = opts[Symbol.for("comments")];

  if (opts.cursorOffset >= 0) {
    // Roughly, our logic for preserving the user's cursor position is as
    // follows:
    // 1. Before formatting, identify from the AST the smallest possible region
    //    of the document that contains the cursor. (This will either be a leaf
    //    node, a range between two nodes, or a range between a node and the
    //    start or end of the document.)
    // 2. During formatting, record where this cursor-containing region gets
    //    written.
    // 3. Run a diff (with only insertions and deletions allowed) of the
    //    original vs formatted version of the region, with the cursor included
    //    as a character in the original version. By undoing the deletion of
    //    the cursor from the diff, we add the cursor to the appropriate point
    //    in the formatted version.
    //
    // Steps 1 and 2 have already happened; now we implement step 3.

    let oldCursorRegionStart;
    let oldCursorRegionText;

    let newCursorRegionStart;
    let newCursorRegionText;

    if (
      (opts.cursorNode || opts.nodeBeforeCursor || opts.nodeAfterCursor) &&
      result.cursorNodeText
    ) {
      newCursorRegionStart = result.cursorNodeStart;
      newCursorRegionText = result.cursorNodeText;

      if (opts.cursorNode) {
        oldCursorRegionStart = opts.locStart(opts.cursorNode);
        oldCursorRegionText = text.slice(
          oldCursorRegionStart,
          opts.locEnd(opts.cursorNode),
        );
      } else {
        if (!opts.nodeBeforeCursor && !opts.nodeAfterCursor) {
          throw new Error(
            "Cursor location must contain at least one of cursorNode, nodeBeforeCursor, nodeAfterCursor",
          );
        }
        oldCursorRegionStart = opts.nodeBeforeCursor
          ? opts.locEnd(opts.nodeBeforeCursor)
          : 0;
        const oldCursorRegionEnd = opts.nodeAfterCursor
          ? opts.locStart(opts.nodeAfterCursor)
          : text.length;

        oldCursorRegionText = text.slice(
          oldCursorRegionStart,
          oldCursorRegionEnd,
        );
      }
    } else {
      oldCursorRegionStart = 0;
      oldCursorRegionText = text;

      newCursorRegionStart = 0;
      newCursorRegionText = result.formatted;
    }

    const cursorOffsetRelativeToOldCursorRegionStart =
      opts.cursorOffset - oldCursorRegionStart;

    if (oldCursorRegionText === newCursorRegionText) {
      return {
        formatted: result.formatted,
        cursorOffset:
          newCursorRegionStart + cursorOffsetRelativeToOldCursorRegionStart,
        comments,
      };
    }

    // diff old and new cursor node texts, with a special cursor
    // symbol inserted to find out where it moves to

    // eslint-disable-next-line unicorn/prefer-spread
    const oldCursorNodeCharArray = oldCursorRegionText.split("");
    oldCursorNodeCharArray.splice(
      cursorOffsetRelativeToOldCursorRegionStart,
      0,
      CURSOR,
    );

    // eslint-disable-next-line unicorn/prefer-spread
    const newCursorNodeCharArray = newCursorRegionText.split("");
    const cursorNodeDiff = diffArrays(
      oldCursorNodeCharArray,
      newCursorNodeCharArray,
    );

    let cursorOffset = newCursorRegionStart;
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

async function hasIgnorePragma(text, options) {
  const selectedParser = await resolveParser(options);
  return selectedParser.hasIgnorePragma?.(text);
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

  if (options.cursorOffset >= 0) {
    options = {
      ...options,
      ...getCursorLocation(ast, options),
    };
  }

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
