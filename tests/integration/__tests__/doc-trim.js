import { outdent } from "outdent";
import prettier from "../../config/prettier-entry.js";

const docPrinter = prettier.doc.printer;
const docBuilders = prettier.doc.builders;

const { printDocToString } = docPrinter;
const { line, trim, group, indent } = docBuilders;

// These tests don't use `runCli` because `trim` is not used by any
// bundled parser (only third-party plugins).

describe("trim", () => {
  test.each([
    ["trims the current line", group(["hello    ", trim]), "hello"],
    [
      "trims existing indentation",
      group([
        "function()",
        line,
        "{",
        indent([
          line,
          group([trim, "#if DEBUG"]),
          line,
          "alert(42);",
          line,
          group([trim, "#endif"]),
        ]),
        line,
        "}",
      ]),
      outdent`
        function()
        {
        #if DEBUG
          alert(42);
        #endif
        }
      `,
    ],
    [
      "ignores trimmed characters when fitting the line",
      group(["hello  ", "  ", trim, line, "world!"]),
      "hello world!",
    ],
  ])("%s", (_, doc, expected) => {
    const result = printDocToString(doc, { printWidth: 12, tabWidth: 2 });

    expect(result).toBeDefined();
    expect(result.formatted).toEqual(expected);
  });
});
