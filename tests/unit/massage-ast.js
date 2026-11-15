import { __debug } from "../../src/index.js";
import { massageAstNode as jsMassageAstNode } from "../../src/language-js/massage-ast/index.js";
import estreeVisitorKeys from "../../src/language-js/traverse/visitor-keys.evaluate.js";
import massageAst from "../../src/main/massage-ast.js";
import { normalizePrinter } from "../../src/main/parser-and-printer.js";

test("massageAst", () => {
  const nonNodeObject = { foo: "foo" };
  const nodeObject = { type: "child" };
  const ast = {
    type: "root",
    nodeObject,
    nonNodeObject,
    comments: [{ type: "comment" }],
    ignored: "ignored",
  };

  const result = massageAst(ast, {
    printer: normalizePrinter({
      massageAstNode: Object.assign(() => {}, {
        ignoredProperties: new Set(["ignored"]),
      }),
      getVisitorKeys: () => ["nodeObject"],
    }),
  });

  expect(result).not.toBe(ast);
  expect(result.ignored).toBeUndefined();
  expect(result.nonNodeObject).toBe(nonNodeObject);
  expect(result.nodeObject).not.toBe(nodeObject);
  expect(result.nodeObject).toStrictEqual(nodeObject);
});

test("rebalances same-operator LogicalExpression clones without mutating original", () => {
  const original = {
    type: "LogicalExpression",
    operator: "&&",
    left: { type: "Identifier", name: "a" },
    right: {
      type: "LogicalExpression",
      operator: "&&",
      left: { type: "Identifier", name: "b" },
      right: {
        type: "LogicalExpression",
        operator: "&&",
        left: { type: "Identifier", name: "c" },
        right: { type: "Identifier", name: "d" },
      },
    },
  };

  const result = massageAst(original, {
    printer: normalizePrinter({
      massageAstNode: jsMassageAstNode,
      getVisitorKeys: (node) => estreeVisitorKeys[node.type] ?? [],
    }),
  });

  expect(original.right.type).toBe("LogicalExpression");
  expect(original.right.right.type).toBe("LogicalExpression");
  expect(result).toStrictEqual({
    type: "LogicalExpression",
    operator: "&&",
    left: {
      type: "LogicalExpression",
      operator: "&&",
      left: {
        type: "LogicalExpression",
        operator: "&&",
        left: { type: "Identifier", name: "a" },
        right: { type: "Identifier", name: "b" },
      },
      right: { type: "Identifier", name: "c" },
    },
    right: { type: "Identifier", name: "d" },
  });
});

test("preserves mixed-operator LogicalExpression clones in massageAst", () => {
  const original = {
    type: "LogicalExpression",
    operator: "&&",
    left: { type: "Identifier", name: "a" },
    right: {
      type: "LogicalExpression",
      operator: "||",
      left: { type: "Identifier", name: "b" },
      right: { type: "Identifier", name: "c" },
    },
  };

  const result = massageAst(original, {
    printer: normalizePrinter({
      massageAstNode: jsMassageAstNode,
      getVisitorKeys: (node) => estreeVisitorKeys[node.type] ?? [],
    }),
  });

  expect(result).toStrictEqual(original);
});

test.each(["babel", "acorn"])(
  "%s postprocess does not rebalance right-nested LogicalExpression",
  async (parser) => {
    const { ast } = await __debug.parse("a && (b && c)", { parser });
    const program = ast.type === "File" ? ast.program : ast;
    const { expression } = program.body[0];

    expect(expression.type).toBe("LogicalExpression");
    expect(expression.left).toMatchObject({ type: "Identifier", name: "a" });
    expect(expression.right).toMatchObject({
      type: "LogicalExpression",
      operator: "&&",
      left: { type: "Identifier", name: "b" },
      right: { type: "Identifier", name: "c" },
    });
  },
);
