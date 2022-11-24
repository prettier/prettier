"use strict";

/** @type {import('prettier')} */
const prettier = require("prettier-local");
const { outdent } = require("outdent");

const { group, indent, line, lineSuffix, lineSuffixBoundary, softline } =
  prettier.doc.builders;

const printDoc = require("../print-doc.js");

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

    const expected = outdent`
      let foo = [
        item1,
        item2, // comment
        item3
      ];
    `;

    expect(printDoc(doc)).toBe(expected);
  });
});
