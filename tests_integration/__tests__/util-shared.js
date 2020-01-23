"use strict";

const sharedUtil = require("../../src/common/util-shared");

test("shared util has correct structure", () => {
  expect(typeof sharedUtil.getMaxContinuousCount).toEqual("function");
  expect(typeof sharedUtil.getStringWidth).toEqual("function");
  expect(typeof sharedUtil.getAlignmentSize).toEqual("function");
  expect(typeof sharedUtil.getIndentSize).toEqual("function");
  expect(typeof sharedUtil.skip).toEqual("function");
  expect(typeof sharedUtil.skipWhitespace).toEqual("function");
  expect(typeof sharedUtil.skipSpaces).toEqual("function");
  expect(typeof sharedUtil.skipToLineEnd).toEqual("function");
  expect(typeof sharedUtil.skipEverythingButNewLine).toEqual("function");
  expect(typeof sharedUtil.skipInlineComment).toEqual("function");
  expect(typeof sharedUtil.skipTrailingComment).toEqual("function");
  expect(typeof sharedUtil.skipNewline).toEqual("function");
  expect(typeof sharedUtil.hasNewline).toEqual("function");
  expect(typeof sharedUtil.hasNewlineInRange).toEqual("function");
  expect(typeof sharedUtil.hasSpaces).toEqual("function");
  expect(typeof sharedUtil.isNextLineEmpty).toEqual("function");
  expect(typeof sharedUtil.isNextLineEmptyAfterIndex).toEqual("function");
  expect(typeof sharedUtil.isPreviousLineEmpty).toEqual("function");
  expect(typeof sharedUtil.getNextNonSpaceNonCommentCharacterIndex).toEqual(
    "function"
  );
  expect(typeof sharedUtil.mapDoc).toEqual("function");
  expect(typeof sharedUtil.makeString).toEqual("function");
});

test("sharedUtil.getMaxContinuousCount", () => {
  const { getMaxContinuousCount } = sharedUtil;

  expect(getMaxContinuousCount("|---|--|-|--|---|", "-")).toEqual(3);
  expect(getMaxContinuousCount("|...|", ".")).toEqual(3);

  const fixture = [
    "([a-f])([a-f])",
    "[a-f][a-f][a-f]",
    "a-fa-fa-fa-f",
    "bbbbbbbbbbbbbbbbbb" // neither `a-f` `[a-f]` `([a-f])` should matches `b`
  ].join("");
  expect(getMaxContinuousCount(fixture, "([a-f])")).toEqual(2);
  expect(getMaxContinuousCount(fixture, "[a-f]")).toEqual(3);
  expect(getMaxContinuousCount(fixture, "a-f")).toEqual(4);
  expect(getMaxContinuousCount(fixture, "([a\\-f])")).toEqual(0);
  expect(getMaxContinuousCount(fixture, "[a\\-f]")).toEqual(0);
  expect(getMaxContinuousCount(fixture, "a\\-f")).toEqual(0);
});
