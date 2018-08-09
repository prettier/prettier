"use strict";

const prettier = require("prettier/local");

test("yaml parser should handle CRLF correctly", () => {
  const input = "a:\r\n  123\r\n";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(prettier.format(input, { parser: "yaml" }))
  ).toMatchSnapshot();
});

test("typescript parser should throw the first error when both JSX and non-JSX mode failed", () => {
  const input = `
import React from "react";

const App = () => (
  <div className="App">
  </div>
);

label:
  `;
  expect(() =>
    prettier.format(input, { parser: "typescript" })
  ).toThrowErrorMatchingSnapshot();
});
