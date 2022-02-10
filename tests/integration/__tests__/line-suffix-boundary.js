/** @type {import('prettier')} */
import prettier from "prettier-local";
import printDoc from "../print-doc.js";

const { group, indent, line, lineSuffix, lineSuffixBoundary, softline } =
  prettier.doc.builders;

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
