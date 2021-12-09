"use strict";

const {
  __debug: { formatAST },
} = require("prettier-local");

describe("formatAST", () => {
  const formatExportSpecifier = (specifier) => {
    const { formatted } = formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [specifier],
          },
        ],
      },
      { parser: "meriyah" }
    );

    return formatted;
  };

  test("Shorthand specifier", () => {
    expect(
      formatExportSpecifier({
        type: "ExportSpecifier",
        local: {
          type: "Identifier",
          name: "specifier1",
        },
        exported: {
          type: "Identifier",
          name: "specifier2",
        },
      })
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 2", () => {
    expect(
      formatExportSpecifier({
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
      })
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 3", () => {
    expect(
      formatExportSpecifier({
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
      })
    ).toMatchSnapshot();
  });

  test("Shorthand specifier 4", () => {
    expect(
      formatExportSpecifier({
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
      })
    ).toMatchSnapshot();
  });
});
