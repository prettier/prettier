import { outdent } from "outdent";
import prettier from "../../config/prettier-entry.js";

describe("infers postcss parser", () => {
  runCli("cli/with-parser-inference", ["--end-of-line", "lf", "*"]).test({
    status: 0,
  });
});

describe("infers postcss parser with --check", () => {
  runCli("cli/with-parser-inference", ["--check", "*"]).test({
    status: 0,
  });
});

describe("infers postcss parser with --list-different", () => {
  runCli("cli/with-parser-inference", ["--list-different", "*"]).test({
    status: 0,
  });
});

describe("infers parser from filename", () => {
  test("json from .prettierrc", async () => {
    expect(
      await prettier.format("  {   }  ", { filepath: "x/y/.prettierrc" }),
    ).toBe("{}\n");
  });

  test("json from .stylelintrc", async () => {
    expect(
      await prettier.format("  {   }  ", { filepath: "x/y/.stylelintrc" }),
    ).toBe("{}\n");
  });

  test("yaml from .stylelintrc", async () => {
    expect(
      await prettier.format("  extends:    ''  ", {
        filepath: "x/y/.stylelintrc",
      }),
    ).toBe('extends: ""\n');
  });

  test("babel from Jakefile", async () => {
    expect(
      await prettier.format("let foo = ( x = 1 ) => x", {
        filepath: "x/y/Jakefile",
      }),
    ).toBe("let foo = (x = 1) => x;\n");
  });

  test("json from .swcrc", async () => {
    expect(
      await prettier.format(
        /* indent */ `
          {
                      "jsc": {
                    // Requires v1.2.50 or upper and requires target to be es2016 or upper.
                        "keepClassNames": false
                      }}
        `,
        { filepath: "/path/to/.swcrc" },
      ),
    ).toBe(
      outdent`
        {
          "jsc": {
            // Requires v1.2.50 or upper and requires target to be es2016 or upper.
            "keepClassNames": false
          }
        }
      ` + "\n",
    );
  });

  test("json from .lintstagedrc", async () => {
    expect(
      await prettier.format("  {  '*':   'your-cmd'  }  ", {
        filepath: "/path/to/.lintstagedrc",
      }),
    ).toBe('{ "*": "your-cmd" }\n');
  });

  test("yaml from .lintstagedrc", async () => {
    expect(
      await prettier.format(
        /* indent */ `
          '*':
                 - your-cmd
        `,
        { filepath: "/path/to/.lintstagedrc" },
      ),
    ).toBe(
      outdent`
        "*":
          - your-cmd
      ` + "\n",
    );
  });
});
