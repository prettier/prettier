import { outdent } from "outdent";
import prettier from "../../config/prettier-entry.js";

const {
  __debug: { parse, formatAST, formatDoc, printToDoc, printDocToString },
  doc: {
    builders,
    utils: { findInDoc },
  },
} = prettier;

const code = outdent`
  const foo =              'bar'
`;
const formatted = 'const foo = "bar";\n';
const options = { parser: "babel", originalText: code };

describe("API", () => {
  let ast;
  let doc;
  beforeAll(async () => {
    ({ ast } = await parse(code, options));
    doc = await printToDoc(code, options);
  });

  test("prettier.parse", () => {
    expect(Array.isArray(ast.program.body)).toBe(true);
  });

  test("prettier.formatAST", async () => {
    const { formatted: formatResultFromAST } = await formatAST(ast, options);
    expect(formatResultFromAST).toBe(formatted);
  });

  test("prettier.printDocToString", async () => {
    const { formatted: stringFromDoc } = await printDocToString(doc, options);
    expect(stringFromDoc).toBe(formatted);
  });

  test("prettier.printToDoc", async () => {
    const hasCursor = (doc) =>
      findInDoc(doc, (doc) => (doc.type === "cursor" ? true : undefined)) ??
      false;

    expect(hasCursor(doc)).toBe(false);

    const optionsWithCursorOffset = {
      ...options,
      cursorOffset: code.indexOf("bar"),
    };
    const docWithCursorOffset = await printToDoc(code, optionsWithCursorOffset);
    expect(hasCursor(docWithCursorOffset)).toBe(true);
    const formatResultWithCursorOffset = await printDocToString(
      docWithCursorOffset,
      optionsWithCursorOffset,
    );
    expect(formatResultWithCursorOffset.formatted).toBe(formatted);
    expect(typeof formatResultWithCursorOffset.cursorNodeStart).toBe("number");
    expect(formatResultWithCursorOffset.cursorNodeText).toBe('"bar"');
  });

  test("prettier.formatDoc", async () => {
    const formatResultFromDoc = await formatDoc(doc, options);
    expect(formatResultFromDoc).toMatchSnapshot();

    const doc2 = new Function(
      `{ ${Object.keys(builders)} }`,
      `return ${formatResultFromDoc}`,
    )(builders);

    const { formatted: stringFromDoc2 } = await printDocToString(doc2, options);
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
      "[indent(hardline), indent(literalline)]",
    );

    expect(
      await formatDoc(fill(["foo", hardline, "bar", literalline, "baz"])),
    ).toBe('fill(["foo", hardline, "bar", literalline, "baz"])');

    expect(
      await formatDoc(indentIfBreak(group(["1", line, "2"]), { groupId: "Q" })),
    ).toBe('indentIfBreak(group(["1", line, "2"]), { groupId: "Q" })');

    expect(await formatDoc(label("foo", group(["1", line, "2"])))).toBe(
      'label("foo", group(["1", line, "2"]))',
    );

    expect(
      await formatDoc([ifBreak("a", "b"), ifBreak("a"), ifBreak("", "b")]),
    ).toBe('[ifBreak("a", "b"), ifBreak("a"), ifBreak("", "b")]');
  });
});
