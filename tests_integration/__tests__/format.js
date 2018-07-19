"use strict";

const prettier = require("prettier/local");

test("yaml parser should handle CRLF correclty", () => {
  const input = "a:\r\n  123\r\n";
  expect(prettier.format(input, { parser: "yaml" })).toMatchSnapshot();
});
