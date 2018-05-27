"use strict";

const semver = require("semver");
const isOldNode = semver.parse(process.version).major <= 4;
if (isOldNode) {
  test.skip();
  return;
}

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
