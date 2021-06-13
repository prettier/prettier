"use strict";

/** @type {import('prettier')} */
const prettier = require("prettier-local");

const { group, indent, line, lineSuffix, lineSuffixBoundary, softline } =
  prettier.doc.builders;

const printDoc = require("../printDoc");

describe("lineSuffixBoundary", () => {
  test("should be correctly treated as a potential line break in `fits`", () => {
    const doc = group([
      "let foo = [",
      indent([
        softline,
        [lineSuffixBoundary, "item1,"],
        line,
        [lineSuffixBoundary, "item2,", lineSuffix(" // comment")],
        line,
        [lineSuffixBoundary, "item3"],
      ]),
      softline,
      "];",
    ]);

    const expected = `let foo = [
  item1,
  item2, // comment
  item3
];`;

    expect(printDoc(doc)).toBe(expected);
  });
});
