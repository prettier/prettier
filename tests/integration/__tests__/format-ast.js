"use strict";

const {
  __debug: { formatAST },
} = require("prettier-local");

describe("formatAST", () => {
  test("Shorthand specifier", () => {
    const { formatted: formatResultFromAST } = formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [
              {
                type: "ExportSpecifier",
                local: {
                  type: "Identifier",
                  name: "specifier1",
                },
                exported: {
                  type: "Identifier",
                  name: "specifier2",
                },
              },
            ],
          },
        ],
      },
      { parser: "meriyah" }
    );
    expect(formatResultFromAST).toMatchSnapshot();
  });

  test("Shorthand specifier 2", () => {
    const { formatted: formatResultFromAST } = formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [
              {
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
              },
            ],
          },
        ],
      },
      { parser: "meriyah" }
    );
    expect(formatResultFromAST).toMatchSnapshot();
  });

  test("Shorthand specifier 3", () => {
    const { formatted: formatResultFromAST } = formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [
              {
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
              },
            ],
          },
        ],
      },
      { parser: "meriyah" }
    );
    expect(formatResultFromAST).toMatchSnapshot();
  });

  test("Shorthand specifier 4", () => {
    const { formatted: formatResultFromAST } = formatAST(
      {
        type: "Program",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [
              {
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
              },
            ],
          },
        ],
      },
      { parser: "meriyah" }
    );
    expect(formatResultFromAST).toMatchSnapshot();
  });
});
