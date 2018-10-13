"use strict";

const sharedUtil = require("../../src/common/util-shared");

test("shared util has correct structure", () => {
  expect(typeof sharedUtil.skipWhitespace).toEqual("function");
  expect(typeof sharedUtil.skipSpaces).toEqual("function");
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
