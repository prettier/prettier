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
  expect(result.nodeObject).toEqual(nodeObject);
});
