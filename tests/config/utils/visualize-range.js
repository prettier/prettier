"use strict";

const LinesAndColumns = require("lines-and-columns").default;
const { codeFrameColumns } = require("@babel/code-frame");
const codeFrameColumnsOptions = {
  linesAbove: Number.POSITIVE_INFINITY,
  linesBelow: Number.POSITIVE_INFINITY,
};

const locationForRange = (text, rangeStart, rangeEnd) => {
  if (rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }
  const lines = new LinesAndColumns(text);
  const start = lines.locationForIndex(rangeStart);
  const end = lines.locationForIndex(rangeEnd);

  start.line += 1;
  start.column += 1;
  end.line += 1;
  if (start.line === end.line) {
    end.column += 1;
  }

  return {
    start,
    end,
  };
};

const visualizeRange = (text, { rangeStart = 0, rangeEnd = text.length }) =>
  codeFrameColumns(
    text,
    locationForRange(text, rangeStart, rangeEnd),
    rangeStart > rangeEnd
      ? { ...codeFrameColumnsOptions, message: "[Reversed range]" }
      : codeFrameColumnsOptions
  );

module.exports = visualizeRange;
