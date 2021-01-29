"use strict";

const {
  __debug: { parse, formatAST, formatDoc, printToDoc, printDocToString },
  doc: { builders },
} = require("prettier-local");
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
  test("prettier.printToDoc", (done) => {
    // If it's array, it's a `concat`
    if (!Array.isArray(doc)) {
      expect(doc.type).toBe("concat");
      expect(Array.isArray(doc.parts)).toBe(true);
    }
    done();
  });

  const formatResultFromDoc = formatDoc(doc, options);
  test("prettier.formatDoc", () => {
    expect(formatResultFromDoc).toMatchSnapshot();
  });

  const { formatted: stringFromDoc } = printDocToString(doc, options);
  test("prettier.printDocToString", () => {
    expect(stringFromDoc).toBe(formatted);
  });

  const doc2 = new Function(
    `{ ${Object.keys(builders)} }`,
    `return ${formatResultFromDoc}`
  )(builders);
  const { formatted: stringFromDoc2 } = printDocToString(doc2, options);
  const formatResultFromDoc2 = formatDoc(doc2, options);
  test("output of prettier.formatDoc can be reused as code", () => {
    expect(stringFromDoc2).toBe(formatted);
    expect(formatResultFromDoc2).toBe(formatResultFromDoc);
  });
});
