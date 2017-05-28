"use strict";

const prettier = require("../..");

test("allows custom parser provided as object", () => {
  const output = prettier.format("1", {
    parser(text) {
      expect(text).toEqual("1");
      return {
        type: "Literal",
        value: 2,
        raw: "2"
      };
    }
  });
  expect(output).toEqual("2");
});

test("allows usage of prettier's supported parsers", () => {
  const output = prettier.format("foo ( )", {
    parser(text, { babylon }) {
      expect(typeof babylon).toEqual("function");
      const ast = babylon(text);
      ast.program.body[0].expression.callee.name = "bar";
      return ast;
    }
  });
  expect(output).toEqual("bar();\n");
});
