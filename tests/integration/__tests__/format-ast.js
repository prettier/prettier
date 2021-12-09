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
});
