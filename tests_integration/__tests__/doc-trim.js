"use strict";

const prettier = require("prettier/local");
const docPrinter = prettier.doc.printer;
const docBuilders = prettier.doc.builders;

const printDocToString = docPrinter.printDocToString;
const concat = docBuilders.concat;
const line = docBuilders.line;
const trim = docBuilders.trim;
const group = docBuilders.group;
const indent = docBuilders.indent;

// These tests don't use `runPrettier` because `trim` is not used by any
// bundled parser (only third-party plugins).

describe("trim", () => {
  test.each([
    ["trims the current line", group(concat(["hello    ", trim])), "hello"],
    [
      "trims existing indentation",
      group(
        concat([
          "function()",
          line,
          "{",
          indent(
            concat([
              line,
              group(concat([trim, "#if DEBUG"])),
              line,
              "alert(42);",
              line,
              group(concat([trim, "#endif"]))
            ])
          ),
          line,
          "}"
        ])
      ),
      `function()
{
#if DEBUG
  alert(42);
#endif
}`
    ],
    [
      "ignores trimmed characters when fitting the line",
      group(concat(["hello  ", "  ", trim, line, "world!"])),
      "hello world!"
    ]
  ])("%s", (_, doc, expected) => {
    const result = printDocToString(doc, { printWidth: 12, tabWidth: 2 });

    expect(result).toBeDefined();
    expect(result.formatted).toEqual(expected);
  });
});
