import prettier from "prettier-local";
import { outdent } from "outdent";

const {
  __debug: { parse, formatAST, formatDoc, printToDoc, printDocToString },
  doc: {
    builders,
    utils: { cleanDoc },
  },
} = prettier;

const code = outdent`
  const foo =              'bar'
`;
const formatted = 'const foo = "bar";\n';
const options = { parser: "babel", originalText: code };

describe("API", () => {
  let ast
  let doc
  beforeAll(async () => {
    ({ ast } = await parse(code, options));
    doc = await printToDoc(code, options);
  })

  test("prettier.parse", () => {
    expect(Array.isArray(ast.program.body)).toBe(true);
  });

  const { formatted: formatResultFromAST } = formatAST(ast, options);
  test("prettier.formatAST", () => {
    expect(formatResultFromAST).toBe(formatted);
  });

  test("prettier.printToDoc", (done) => {
    // If it's array, it's a `concat`
    if (!Array.isArray(doc)) {
      expect(doc.type).toBe("concat");
      expect(Array.isArray(doc.parts)).toBe(true);
    }
    done();
  });

  test("prettier.printDocToString", () => {
    const { formatted: stringFromDoc } = printDocToString(doc, options);
    expect(stringFromDoc).toBe(formatted);
  });

  test("prettier.formatDoc", async () => {
    const formatResultFromDoc = await formatDoc(doc, options);
    expect(formatResultFromDoc).toMatchSnapshot();

    const doc2 = new Function(
      `{ ${Object.keys(builders)} }`,
      `return ${formatResultFromDoc}`
    )(builders);

    const { formatted: stringFromDoc2 } = printDocToString(doc2, options);
    expect(stringFromDoc2).toBe(formatted);

    const formatResultFromDoc2 = await formatDoc(doc2, options);
    expect(formatResultFromDoc2).toBe(formatResultFromDoc);
  });

  test("prettier.formatDoc prints things as expected", async () => {
    const {
      indent,
      hardline,
      literalline,
      fill,
      ifBreak,
      indentIfBreak,
      group,
      line,
      label,
    } = builders;

    expect(await formatDoc([indent(hardline), indent(literalline)])).toBe(
      "[indent(hardline), indent(literalline)]"
    );

    expect(
      await formatDoc(fill(["foo", hardline, "bar", literalline, "baz"]))
    ).toBe('fill(["foo", hardline, "bar", literalline, "baz"])');

    expect(
      await formatDoc(
        // The argument of fill must not be passed to cleanDoc because it's not a doc
        fill(cleanDoc(["foo", literalline, "bar"])) // invalid fill
      )
    ).toBe('fill(["foo", literallineWithoutBreakParent, breakParent, "bar"])');

    expect(
      await formatDoc(indentIfBreak(group(["1", line, "2"]), { groupId: "Q" }))
    ).toBe('indentIfBreak(group(["1", line, "2"]), { groupId: "Q" })');

    expect(await formatDoc(label("foo", group(["1", line, "2"])))).toBe(
      'label("foo", group(["1", line, "2"]))'
    );

    expect(
      await formatDoc([ifBreak("a", "b"), ifBreak("a"), ifBreak("", "b")])
    ).toBe('[ifBreak("a", "b"), ifBreak("a"), ifBreak("", "b")]');
  });
});
