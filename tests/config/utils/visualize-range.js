import { codeFrameColumns } from "@babel/code-frame";
import indexToPosition from "index-to-position";
const codeFrameColumnsOptions = {
  linesAbove: Number.POSITIVE_INFINITY,
  linesBelow: Number.POSITIVE_INFINITY,
};

const locationForRange = (text, rangeStart, rangeEnd) => {
  if (rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }

  const [start, end] = [rangeStart, rangeEnd].map((index) => {
    const isOutOfBoundary = index >= text.length;

    const position = indexToPosition(
      text,
      isOutOfBoundary ? text.length - 1 : index,
      { oneBased: true },
    );

    if (isOutOfBoundary) {
      position.column += 1;
    }

    return position;
  });

  if (start.line !== end.line) {
    end.column -= 1;
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
      : codeFrameColumnsOptions,
  );

export default visualizeRange;
