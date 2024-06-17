import { outdent } from "outdent";

import prettier from "../../config/prettier-entry.js";
import fooPlugin from "../plugins/defaultOptions/plugin.cjs";

test("yaml parser should handle CRLF correctly", async () => {
  const input = "a:\r\n  123\r\n";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(
      await prettier.format(input, { parser: "yaml", endOfLine: "auto" }),
    ),
  ).toMatchSnapshot();
});

test("typescript parser should throw the first error when both JSX and non-JSX mode failed", async () => {
  const input = outdent`
    import React from "react";

    const App = () => (
      <div className="App">
      </div>
    );

    label:
  `;
  await expect(
    prettier.format(input, { parser: "typescript", filepath: "foo.unknown" }),
  ).rejects.toThrowErrorMatchingSnapshot();
});

test("html parser should handle CRLF correctly", async () => {
  const input = "<!--\r\n  test\r\n  test\r\n-->";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(
      await prettier.format(input, { parser: "html", endOfLine: "auto" }),
    ),
  ).toMatchSnapshot();
});

test("markdown parser should handle CRLF correctly", async () => {
  const input = "```\r\n\r\n\r\n```";
  expect(
    // use JSON.stringify to observe CRLF
    JSON.stringify(
      await prettier.format(input, { parser: "markdown", endOfLine: "auto" }),
    ),
  ).toMatchSnapshot();
});

test("should work with foo plugin instance", async () => {
  const input = "a:\r\n  123\r\n";
  expect(
    JSON.stringify(
      await prettier.format(input, {
        parser: "foo-parser",
        plugins: [fooPlugin],
      }),
    ),
  ).toMatchInlineSnapshot(
    String.raw`""{\"tabWidth\":8,\"bracketSpacing\":false}""`,
  );
});

test("'Adjacent JSX' error should not be swallowed by Babel's error recovery", async () => {
  const input = "<a></a>\n<b></b>";
  await expect(
    prettier.format(input, { parser: "babel" }),
  ).rejects.toThrowErrorMatchingSnapshot();
});
