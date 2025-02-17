import prettier from "../../config/prettier-entry.js";
const { formatAST } = prettier.__debug;

describe("formatAST", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  beforeAll(() => {
    process.env.NODE_ENV = "production";
  });
  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const formatExportSpecifier = async (specifier) => {
    const { formatted } = await formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [specifier],
          },
        ],
      },
      { parser: "meriyah" },
    );

    return formatted;
  };

  test("Shorthand specifier", async () => {
    expect(
      await formatExportSpecifier({
        type: "ExportSpecifier",
        local: {
          type: "Identifier",
          name: "specifier1",
        },
        exported: {
          type: "Identifier",
          name: "specifier2",
        },
      }),
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 2", async () => {
    expect(
      await formatExportSpecifier({
        type: "ExportSpecifier",
        local: {
          type: "Identifier",
          name: "specifier1",
          range: [0, 0],
        },
        exported: {
          type: "Identifier",
          name: "specifier2",
          range: [0, 0],
        },
      }),
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 3", async () => {
    expect(
      await formatExportSpecifier({
        type: "ExportSpecifier",
        local: {
          type: "Literal",
          value: "specifier",
          raw: '"specifier"',
          range: [0, 0],
        },
        exported: {
          type: "Identifier",
          name: "specifier",
          range: [0, 0],
        },
      }),
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 4", async () => {
    expect(
      await formatExportSpecifier({
        type: "ExportSpecifier",
        local: {
          type: "Literal",
          value: "specifier",
          raw: '"specifier"',
          range: [0, 0],
        },
        exported: {
          type: "Literal",
          value: "specifier",
          raw: "'specifier'",
          range: [0, 0],
        },
      }),
    ).toMatchSnapshot();
  });
});
