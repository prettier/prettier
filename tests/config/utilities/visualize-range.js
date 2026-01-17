import { codeFrameColumns } from "@babel/code-frame";
import indexToPosition from "index-to-position";
const codeFrameColumnsOptions = {
  linesAbove: Number.POSITIVE_INFINITY,
  linesBelow: Number.POSITIVE_INFINITY,
};

const locationForRange = (text, range) => {
  const [start, end] = [...range]
    .sort((indexA, indexB) => indexA - indexB)
    .map((index) => indexToPosition(text, index, { oneBased: true }));

  if (start.line !== end.line) {
    end.column -= 1;
  }

  return { start, end };
};

const visualizeRange = (text, { rangeStart = 0, rangeEnd = text.length }) =>
  codeFrameColumns(
    text,
    locationForRange(text, [rangeStart, rangeEnd]),
    rangeStart > rangeEnd
      ? { ...codeFrameColumnsOptions, message: "[Reversed range]" }
      : codeFrameColumnsOptions,
  );

export default visualizeRange;
