"use strict";

const prettier = require("prettier/local");

test("yaml parser should handle CRLF correctly", () => {
  const input = "a:\r\n  123\r\n";
  expect(prettier.format(input, { parser: "yaml" })).toMatchSnapshot();
});

test("typescript parser should throw the first error when both JSX and non-JSX mode failed", () => {
  const input =
    '\nimport React from "react";\n\nconst App = () => (\n  <div className="App">\n  </div>\n);\n\nlabel:\n  ';
  expect(() =>
    prettier.format(input, { parser: "typescript" })
  ).toThrowErrorMatchingSnapshot();
});
