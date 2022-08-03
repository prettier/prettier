import AstPath from "../../src/common/ast-path.js"


describe("AstPath", () => {
  const ast = {
    property: [
      {index: 0},
      {index: 1},
    ]
  }

  test("AstPath#call()", () => {
    expect(new AstPath(ast).call((path) => path.getValue(), "property")).toBe(ast.property);

    const path = new AstPath(ast)
    try {
      path.call(() => {
        throw new Error("A dummy error")
      }, "property")
    } catch {
      // No op
    }
    expect(path.stack.length).toBe(1)
  })
});
