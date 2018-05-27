"use strict";

const sharedUtil = require("../../src/common/util-shared");

test("shared util has correct structure", () => {
  expect(typeof sharedUtil.isNextLineEmpty).toEqual("function");
  expect(typeof sharedUtil.isNextLineEmptyAfterIndex).toEqual("function");
  expect(typeof sharedUtil.getNextNonSpaceNonCommentCharacterIndex).toEqual(
    "function"
  );
  expect(typeof sharedUtil.mapDoc).toEqual("function");
  expect(typeof sharedUtil.makeString).toEqual("function");
});
