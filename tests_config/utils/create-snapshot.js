"use strict";

const raw = require("jest-snapshot-serializer-raw").wrap;
const visualizeRange = require("./visualize-range");
const visualizeEndOfLine = require("./visualize-end-of-line");
const composeOptionsForSnapshot = require("./compose-options-for-snapshot");

const CURSOR_PLACEHOLDER = "<|>";

function printSeparator(width, description = "") {
  const leftLength = Math.floor((width - description.length) / 2);
  const rightLength = width - leftLength - description.length;
  return "=".repeat(leftLength) + description + "=".repeat(rightLength);
}

function stringify(value) {
  return value === Number.POSITIVE_INFINITY
    ? "Infinity"
    : Array.isArray(value)
    ? `[${value.map((v) => JSON.stringify(v)).join(", ")}]`
    : JSON.stringify(value);
}

function printOptions(options) {
  const keys = Object.keys(options).sort();
  return keys.map((key) => `${key}: ${stringify(options[key])}`).join("\n");
}

function createSnapshot(formatResult, { parsers, formatOptions }) {
  const optionsForSnapshot = composeOptionsForSnapshot(
    formatResult.options,
    parsers
  );

  // All parsers have the same result, only snapshot the result from main parser
  // TODO: move this part to `createSnapshot`
  const hasEndOfLine = "endOfLine" in formatOptions;
  let codeForSnapshot = formatResult.inputWithCursor;
  let codeOffset = 0;
  let resultForSnapshot = formatResult.outputWithCursor;
  const {
    rangeStart,
    rangeEnd,
    cursorOffset,
    printWidth,
  } = formatResult.options;

  if (typeof rangeStart === "number" || typeof rangeEnd === "number") {
    let rangeStartWithCursor = rangeStart;
    let rangeEndWithCursor = rangeEnd;
    if (typeof cursorOffset === "number") {
      if (
        typeof rangeStartWithCursor === "number" &&
        rangeStartWithCursor > cursorOffset
      ) {
        rangeStartWithCursor += CURSOR_PLACEHOLDER.length;
      }
      if (
        typeof rangeEndWithCursor === "number" &&
        rangeEndWithCursor > cursorOffset
      ) {
        rangeEndWithCursor += CURSOR_PLACEHOLDER.length;
      }
    }

    codeForSnapshot = visualizeRange(codeForSnapshot, {
      rangeStart: rangeStartWithCursor,
      rangeEnd: rangeEndWithCursor,
    });
    codeOffset = codeForSnapshot.match(/^>?\s+1 \|/)[0].length + 1;
  }

  if (hasEndOfLine) {
    codeForSnapshot = visualizeEndOfLine(codeForSnapshot);
    resultForSnapshot = visualizeEndOfLine(resultForSnapshot);
  }

  const separatorWidth = 80;
  const printWidthIndicator =
    printWidth > 0 && Number.isFinite(printWidth)
      ? [
          (codeOffset ? " ".repeat(codeOffset - 1) + "|" : "") +
            " ".repeat(printWidth) +
            "| printWidth",
        ]
      : [];

  return raw(
    [
      printSeparator(separatorWidth, "options"),
      printOptions(optionsForSnapshot),
      ...printWidthIndicator,
      printSeparator(separatorWidth, "input"),
      codeForSnapshot,
      printSeparator(separatorWidth, "output"),
      resultForSnapshot,
      printSeparator(separatorWidth),
    ].join("\n")
  );
}

module.exports = createSnapshot;
