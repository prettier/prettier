"use strict";

const prettier = require("prettier-local");
const runPrettier = require("../runPrettier.js");

test("allows custom parser provided as object", () => {
  const output = prettier.format("1", {
    parser(text) {
      expect(text).toEqual("1");
      return {
        type: "Literal",
        value: 2,
        raw: "2",
      };
    },
  });
  expect(output).toEqual("2");
});

test("allows usage of prettier's supported parsers", () => {
  const output = prettier.format("foo ( )", {
    parser(text, parsers) {
      expect(typeof parsers.babel).toEqual("function");
      const ast = parsers.babel(text);
      ast.program.body[0].expression.callee.name = "bar";
      return ast;
    },
  });
  expect(output).toEqual("bar();\n");
});

test("allows add empty `trailingComments` array", () => {
  const output = prettier.format("(foo /* comment */)( )", {
    parser(text, parsers) {
      const ast = parsers.babel(text);

      // This may happens in this use case https://github.com/prettier/prettier/pull/5497#issuecomment-439841965
      // Simply simulate it
      const callExpression = ast.program.body[0].expression;
      callExpression.extra = { parenthesized: true };
      callExpression.trailingComments = [];

      return ast;
    },
  });
  expect(output).toEqual("foo(/* comment */);\n");
});

test("allows early comment attachment", () => {
  const output = prettier.format("/* comment */\nfoo(); 1", {
    parser(text, parsers, opts) {
      // Use parser that does not attach comments.
      const ast = parsers.flow(text);
      expect(Array.isArray(ast.comments)).toBe(true);
      expect(ast.comments.length).toBe(1);

      const callStmt = ast.body[0];
      expect(Array.isArray(callStmt.comments)).toBe(false);

      prettier.util.attachComments(text, ast, opts);

      expect(Array.isArray(callStmt.comments)).toBe(true);
      expect(callStmt.comments.length).toBe(1);

      // Mutate AST
      ast.body.reverse();

      return ast;
    },
  });
  expect(output).toEqual("1;\n/* comment */\nfoo();\n");
});

describe("allows passing a string to resolve a parser", () => {
  runPrettier("./custom-parsers/", [
    "--end-of-line",
    "lf",
    "./custom-rename-input.js",
    "--parser",
    "./custom-rename-parser",
  ]).test({
    status: 0,
  });
});
