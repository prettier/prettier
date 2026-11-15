import prettier from "../../config/prettier-entry.js";

describe("write cursorOffset to stderr with --cursor-offset <int>", () => {
  runCli("cli", ["--cursor-offset", "2", "--parser", "babel"], {
    input: " 1",
  }).test({
    status: 0,
  });
});

describe("cursor positions when inserting a pragma", () => {
  test.each([
    ["babel", "const fo|o=1", "/** @format */\n\nconst fo|o = 1;\n"],
    [
      "babel",
      "const fo|o=1\r\n",
      "/** @format */\r\n\r\nconst fo|o = 1;\r\n",
      { endOfLine: "crlf" },
    ],
    ["babel", "for|mat", "/** @format */\n\nfor|mat;\n"],
    ["babel", "|const foo=1", "|/** @format */\n\nconst foo = 1;\n"],
    ["babel", "const foo=1|", "/** @format */\n\nconst foo = 1|;\n"],
    [
      "babel",
      "#!/usr/bin/en|v node\nconst foo=1",
      "#!/usr/bin/en|v node\n/** @format */\n\nconst foo = 1;\n",
    ],
    [
      "babel",
      "#!/usr/bin/env node\nconst fo|o=1",
      "#!/usr/bin/env node\n/** @format */\n\nconst fo|o = 1;\n",
    ],
    [
      "babel",
      "/** license */\nconst fo|o=1",
      "/**\n * license\n *\n * @format\n */\n\nconst fo|o = 1;\n",
    ],
    [
      "babel",
      "/** copy|right */\nconst foo=1",
      "/**\n * copy|right\n *\n * @format\n */\n\nconst foo = 1;\n",
    ],
    [
      "babel",
      "/** @format */\nconst fo|o=1",
      "/** @format */\nconst fo|o = 1;\n",
    ],
    ["css", "a{col|or:red}", "/** @format */\n\na {\n  col|or: red;\n}\n"],
    [
      "html",
      "<!|-- comment -->\n<div>hello</div>",
      "<!-- @format -->\n\n<!|-- comment -->\n<div>hello</div>\n",
    ],
    [
      "markdown",
      "---\ntitle: hel|lo\n---\n\n# Title",
      "---\ntitle: hel|lo\n---\n\n<!-- @format -->\n\n# Title\n",
    ],
    [
      "markdown",
      "---\ntitle: hello\n---\n\n# Ti|tle",
      "---\ntitle: hello\n---\n\n<!-- @format -->\n\n# Ti|tle\n",
    ],
  ])("%s: %j", async (parser, input, expected, options) => {
    const { formatted, cursorOffset } = await prettier.formatWithCursor(
      input.replace("|", ""),
      {
        parser,
        cursorOffset: input.indexOf("|"),
        insertPragma: true,
        ...options,
      },
    );
    expect(formatted).toBe(expected.replace("|", ""));
    expect(cursorOffset).toBe(expected.indexOf("|"));
  });

  test.each([-1, 100])("disabled cursor at %i", async (cursorOffset) => {
    expect(
      await prettier.formatWithCursor("const foo=1", {
        parser: "babel",
        cursorOffset,
        insertPragma: true,
      }),
    ).toMatchObject({
      formatted: "/** @format */\n\nconst foo = 1;\n",
      cursorOffset: -1,
    });
  });
});

describe("cursorOffset should not be affected by full-width character", () => {
  runCli("cli", ["--cursor-offset", "21", "--parser", "babel"], {
    input:
      'const x = ["中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文", "中文"];',
    //                              ^ offset = 21                              ^ width = 80
  }).test({
    /**
     * const x = [
     *   "中文",
     *   "中文",
     *        ^ offset = 26
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文",
     *   "中文"
     * ];
     */
    stderr: "26",
    status: 0,
  });
});
