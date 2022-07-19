"use strict";

const prettier = require("prettier-local");
const { outdent } = require("outdent");
const runPrettier = require("../run-prettier.js");

describe("infers postcss parser", () => {
  runPrettier("cli/with-parser-inference", ["--end-of-line", "lf", "*"]).test({
    status: 0,
  });
});

describe("infers postcss parser with --check", () => {
  runPrettier("cli/with-parser-inference", ["--check", "*"]).test({
    status: 0,
  });
});

describe("infers postcss parser with --list-different", () => {
  runPrettier("cli/with-parser-inference", ["--list-different", "*"]).test({
    status: 0,
  });
});

describe("infers parser from filename", () => {
  test("json from .prettierrc", () => {
    expect(prettier.format("  {   }  ", { filepath: "x/y/.prettierrc" })).toBe(
      "{}\n"
    );
  });

  test("json from .stylelintrc", () => {
    expect(prettier.format("  {   }  ", { filepath: "x/y/.stylelintrc" })).toBe(
      "{}\n"
    );
  });

  test("yaml from .stylelintrc", () => {
    expect(
      prettier.format("  extends:    ''  ", { filepath: "x/y/.stylelintrc" })
    ).toBe('extends: ""\n');
  });

  test("babel from Jakefile", () => {
    expect(
      prettier.format("let foo = ( x = 1 ) => x", { filepath: "x/y/Jakefile" })
    ).toBe("let foo = (x = 1) => x;\n");
  });

  test("json from .swcrc", () => {
    expect(
      prettier.format(
        /* indent */ `
          {
                      "jsc": {
                    // Requires v1.2.50 or upper and requires target to be es2016 or upper.
                        "keepClassNames": false
                      }}
        `,
        { filepath: "/path/to/.swcrc" }
      )
    ).toBe(
      outdent`
        {
          "jsc": {
            // Requires v1.2.50 or upper and requires target to be es2016 or upper.
            "keepClassNames": false
          }
        }
      ` + "\n"
    );
  });

  test("json from .lintstagedrc", () => {
    expect(
      prettier.format("  {  '*':   'your-cmd'  }  ", {
        filepath: "/path/to/.lintstagedrc",
      })
    ).toBe('{ "*": "your-cmd" }\n');
  });

  test("yaml from .lintstagedrc", () => {
    expect(
      prettier.format(
        /* indent */ `
          '*':
                 - your-cmd
        `,
        { filepath: "/path/to/.lintstagedrc" }
      )
    ).toBe(
      outdent`
        "*":
          - your-cmd
      ` + "\n"
    );
  });
});
