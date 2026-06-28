import massageAst from "../../src/main/massage-ast.js";
import { normalizePrinter } from "../../src/main/parser-and-printer.js";
import { massageAstNode as massageYamlAstNode } from "../../src/language-yaml/massage-ast/index.js";

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

test("YAML block scalar value massage", () => {
  for (const chomping of ["clip", "strip"]) {
    const original = {
      type: "blockLiteral",
      chomping,
      value: "line\n\n",
    };
    const cloned = { ...original };

    massageYamlAstNode(original, cloned);

    expect(cloned.value).toBe(original.value);
  }

  const original = {
    type: "blockFolded",
    chomping: "keep",
    value: "line  \nnext\t\n",
  };
  const cloned = { ...original };

  massageYamlAstNode(original, cloned);

  expect(cloned.value).toBe("line\nnext\n");
});
