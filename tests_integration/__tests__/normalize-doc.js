"use strict";

const prettier = require("prettier/local");
const docBuilders = prettier.doc.builders;
const docUtils = prettier.doc.utils;

const { normalizeDoc } = docUtils;
const { group, concat, fill } = docBuilders;

describe("normalizeDoc", () => {
  test.each([
    [
      "removes empty strings",
      concat(["", "foo", fill(["", "bar", ""]), ""]),
      concat(["foo", fill(["bar"])]),
    ],
    [
      "flattens nested concats",
      concat(["foo", "", concat(["bar", "", concat(["baz", ""])])]),
      concat(["foobarbaz"]),
    ],
    [
      "flattens nested concats in other docs",
      group(concat(["foo", concat(["bar", "", concat(["baz", ""])])])),
      group(concat(["foobarbaz"])),
    ],
    [
      "keeps groups",
      concat([group("foo"), group("bar"), group("baz")]),
      concat([group("foo"), group("bar"), group("baz")]),
    ],
    [
      "keeps fills",
      fill(["foo", fill(["bar", fill(["baz"])])]),
      fill(["foo", fill(["bar", fill(["baz"])])]),
    ],
  ])("%s", (_, doc, expected) => {
    const result = normalizeDoc(doc);

    expect(result).toEqual(expected);
  });
});
