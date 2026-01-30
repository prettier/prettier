import { wrap as raw } from "jest-snapshot-serializer-raw";
import { CURSOR_PLACEHOLDER } from "./constants.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";
import visualizeRange from "./visualize-range.js";

const DEFAULT_PRINT_WIDTH = 80;
const SEPARATOR_WIDTH = DEFAULT_PRINT_WIDTH;
function printSeparator(description = "") {
  const leftLength = Math.floor((SEPARATOR_WIDTH - description.length) / 2);
  const rightLength = SEPARATOR_WIDTH - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function stringify(value) {
  if (value === Number.POSITIVE_INFINITY) {
    return "Infinity";
  }

  if (Array.isArray(value)) {
    return `[${value.map((v) => JSON.stringify(v)).join(", ")}]`;
  }

  return JSON.stringify(value);
}

function printOptions(options) {
  const {
    plugins,
    filepath,
    errors,
    parser,

    ...snapshotOptions
  } = options;

  const keys = Object.keys(snapshotOptions).sort();
  return keys
    .map((key) => `${key}: ${stringify(snapshotOptions[key])}`)
    .join("\n");
}

function makeWidthIndicator(printWidth) {
  const text =
    printWidth === undefined
      ? `printWidth: ${DEFAULT_PRINT_WIDTH} (default)`
      : `printWidth: ${printWidth}`;

  printWidth ??= DEFAULT_PRINT_WIDTH;

  return printWidth >= text.length + 2
    ? (text + " |").padStart(printWidth, " ")
    : " ".repeat(printWidth) + "| " + text;
}

const defaultWidthIndicator = makeWidthIndicator();
function printWidthIndicator(printWidth) {
  if (
    !(
      printWidth === undefined ||
      (Number.isSafeInteger(printWidth) && printWidth > 0)
    )
  ) {
    return "";
  }

  const widthIndicator =
    printWidth === undefined
      ? defaultWidthIndicator
      : makeWidthIndicator(printWidth);

  return widthIndicator;
}

function createSnapshot(formatResult, { parsers, formatOptions }) {
  let {
    inputWithCursor: input,
    outputWithCursor: output,
    options,
  } = formatResult;
  let { rangeStart, rangeEnd, cursorOffset, printWidth } = options;

  let codeOffset = 0;
  if (typeof rangeStart === "number" || typeof rangeEnd === "number") {
    if (typeof cursorOffset === "number") {
      if (typeof rangeStart === "number" && rangeStart > cursorOffset) {
        rangeStart += CURSOR_PLACEHOLDER.length;
      }
      if (typeof rangeEnd === "number" && rangeEnd > cursorOffset) {
        rangeEnd += CURSOR_PLACEHOLDER.length;
      }
    }

    input = visualizeRange(input, { rangeStart, rangeEnd });
    codeOffset = input.match(/^>?\s+1 \|/)[0].length;
  }

  if ("endOfLine" in formatOptions) {
    input = visualizeEndOfLine(input);
    output = visualizeEndOfLine(output);
  }

  const widthIndicator = printWidthIndicator(printWidth, codeOffset);

  return raw(
    [
      addOffset(
        [
          printSeparator("options"),
          printOptions({ ...options, parsers }),
          ...(widthIndicator ? [widthIndicator] : []),
          printSeparator("input"),
        ].join("\n"),
        codeOffset,
      ),
      input,
      addOffset(
        [printSeparator("output"), output, printSeparator()].join("\n"),
        codeOffset,
      ),
    ].join("\n"),
  );
}

function addOffset(text, offset) {
  if (!offset) {
    return text;
  }

  const prefix = " ".repeat(offset - 1) + ":";
  return text
    .split("\n")
    .map((line) => `${prefix}${line ? ` ${line}` : line}`)
    .join("\n");
}

export default createSnapshot;
