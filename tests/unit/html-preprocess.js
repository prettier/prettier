import * as prettier from "../../src/index.js";
import preprocess from "../../src/language-html/print-preprocess.js";

const cases = [
  { name: "text", content: "\nhello", expected: "hello" },
  {
    name: "interpolation",
    content: "\n{{ value }}",
    expected: "{{ value }}",
  },
  {
    name: "indented interpolation",
    content: "\n    {{ value }}tail",
    expected: "    {{ value }}tail",
  },
  { name: "remaining LF", content: "\n\nhello", expected: "\nhello" },
  { name: "only LF", content: "\n", expected: "" },
  { name: "no LF", content: "hello", expected: "hello" },
  { name: "spaces before LF", content: " \nhello", expected: " \nhello" },
];

describe.each(["html", "angular", "vue"])("%s", (parser) => {
  describe.each(["pre", "textarea"])("<%s>", (tagName) => {
    test.each(cases)(
      "source spans for $name",
      async ({ content, expected }) => {
        const elementText = `<${tagName}>${content}</${tagName}>`;
        const input =
          parser === "vue"
            ? `<template>${elementText}</template>`
            : elementText;
        const { ast } = await prettier.__debug.parse(input, { parser });
        preprocess(ast, {
          parser,
          originalText: input,
          htmlWhitespaceSensitivity: "css",
        });
        const element =
          parser === "vue" ? ast.children[0].children[0] : ast.children[0];

        expect(
          element.children.map((child) => child.sourceSpan.toString()).join(""),
        ).toBe(expected);

        element.walk((node) => {
          if (node.kind === "text") {
            expect(node.sourceSpan.toString()).toBe(node.value);
          }
        });
      },
    );
  });
});
