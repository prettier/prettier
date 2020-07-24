"use strict";

const {
  parse,
  formatAST,
  formatDoc,
  printToDoc,
  printDocToString,
} = require("prettier/local").__debug;
const { outdent } = require("outdent");

const code = outdent`
  const foo =              'bar'
`;
const formatted = 'const foo = "bar";\n';
const options = { parser: "babel", originalText: code };

describe("API", () => {
  const { ast } = parse(code, options);
  test("prettier.parse", () => {
    expect(Array.isArray(ast.program.body)).toBe(true);
  });

  const { formatted: formatResultFromAST } = formatAST(ast, options);
  test("prettier.formatAST", () => {
    expect(formatResultFromAST).toBe(formatted);
  });

  const doc = printToDoc(code, options);
  test("prettier.printToDoc", () => {
    expect(doc.type).toBe("concat");
    expect(Array.isArray(doc.parts)).toBe(true);
  });

  const formatResultFromDoc = formatDoc(doc, options);
  test("prettier.formatDoc", () => {
    expect(formatResultFromDoc).toMatchSnapshot();
  });

  const { formatted: stringFromDoc } = printDocToString(doc, options);
  test("prettier.printDocToString", () => {
    expect(stringFromDoc).toBe(formatted);
  });
});
