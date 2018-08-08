"use strict";

const prettier = require("prettier/local");

test("yaml parser should handle CRLF correctly", () => {
  const input = "a:\r\n  123\r\n";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(prettier.format(input, { parser: "yaml" }))
  ).toMatchSnapshot();
});
