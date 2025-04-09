import prettier from "../../config/prettier-entry.js";
const docPrinter = prettier.doc.printer;
const docBuilders = prettier.doc.builders;

const { printDocToString } = docPrinter;
const { hardline, literalline, trim, indent, markAsRoot } = docBuilders;

describe("markAsRoot", () => {
  test.each([
    [
      "with hardline will insert a newline with current indentation",
      [indent(markAsRoot(indent(hardline))), "123"],
      "\n    123",
    ],
    [
      "with literalline will insert a newline with root indentation",
      [indent(markAsRoot(indent(literalline))), "123"],
      "\n  123",
    ],
    [
      "followed by trim will trims up to the first column, ignoring indented root",
      [indent(markAsRoot(indent(literalline))), trim, "123"],
      "\n123",
    ],
  ])("%s", (_, doc, expected) => {
    const result = printDocToString(doc, { printWidth: 80, tabWidth: 2 });

    expect(result).toBeDefined();
    expect(result.formatted).toEqual(expected);
  });
});
