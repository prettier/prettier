import { outdent } from "outdent";
/** @type {import('prettier')} */
import prettier from "../../config/prettier-entry.js";
import printDoc from "../print-doc.js";

const { group, indent, line, lineSuffix, lineSuffixBoundary, softline } =
  prettier.doc.builders;

describe("lineSuffixBoundary", () => {
  test("should be correctly treated as a potential line break in `fits`", async () => {
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

    expect(await printDoc(doc)).toBe(expected);
  });
});
