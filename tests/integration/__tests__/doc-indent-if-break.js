import prettier from "../../config/prettier-entry.js";

const docPrinter = prettier.doc.printer;
const docBuilders = prettier.doc.builders;

const { printDocToString } = docPrinter;
const { softline, indentIfBreak } = docBuilders;

describe("trim", () => {
  test.each([
    [
      "Non-exits group",
      indentIfBreak([softline, "foo"], { groupId: Symbol("non-exits-group") }),
      "\n  foo",
    ],
  ])("%s", (_, doc, expected) => {
    const result = printDocToString(doc, { printWidth: 12, tabWidth: 2 });

    expect(result).toBeDefined();
    expect(result.formatted).toEqual(expected);
  });
});
