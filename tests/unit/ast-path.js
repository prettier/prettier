/* eslint-disable prettier-internal-rules/no-useless-ast-path-callback-parameter */
import AstPath from "../../src/common/ast-path.js";

const error = new Error("A dummy error");
const throwError = () => {
  throw error;
};

describe("AstPath", () => {
  const ast = {
    property: {
      deep: { name: "deep" },
    },
    children: [{ index: 0 }, { index: 1 }],
    propertyWithUndefinedValue: undefined,
    propertyWithNullValue: null,
  };

  test("AstPath#call()", () => {
    const path = new AstPath(ast);

    expect(path.call(() => path.getValue(), "property")).toBe(ast.property);
    expect(() => path.call(throwError, "property")).toThrow(error);
    expect(path.stack.length).toBe(1);
    expect(
      path.call(() => path.getValue(), "noneExitsProperty"),
    ).toBeUndefined();
    expect(
      path.call(() => path.getValue(), "propertyWithUndefinedValue"),
    ).toBeUndefined();
    expect(
      path.call(() => path.getValue(), "propertyWithNullValue"),
    ).toBeNull();
    expect(
      path.call(
        () => path.getValue(),
        "noneExitsProperty",
        "noneExitsPropertyChild",
      ),
    ).toBeUndefined();
  });

  test("AstPath#callParent()", () => {
    const path = new AstPath(ast);
    path.stack.push("property", ast.property, "deep", ast.property.deep);

    expect(path.callParent(() => path.getValue())).toBe(ast.property);
    expect(() => path.callParent(throwError)).toThrow(error);
    expect(path.stack.length).toBe(5);
  });

  test("AstPath#each()", () => {
    const path = new AstPath(ast);

    {
      const called = [];
      path.each(() => called.push(path.getValue()), "children");
      expect(called).toEqual(ast.children);
    }

    {
      const called = [];
      expect(() => {
        path.each((_, index) => {
          if (index === 1) {
            throwError();
          }
          called.push(path.getValue());
        }, "children");
      }).toThrow(error);
      expect(called.length).toBe(1);
      expect(path.stack.length).toBe(1);
    }
  });

  test("AstPath#map()", () => {
    const path = new AstPath(ast);

    expect(path.map(() => path.getValue(), "children")).toEqual(ast.children);

    {
      let result;
      expect(() => {
        result = path.map((_, index) => {
          if (index === 1) {
            throwError();
          }
          return path.getValue();
        }, "children");
      }).toThrow(error);
      expect(result).toBeUndefined();
      expect(path.stack.length).toBe(1);
    }
  });
});
