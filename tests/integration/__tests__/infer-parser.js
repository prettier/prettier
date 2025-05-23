import url from "node:url";
import prettier from "../../config/prettier-entry.js";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("stdin no path and no parser", () => {
  describe("logs error and exits with 2", () => {
    runCli("cli/infer-parser/", [], { input: "foo" }).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("--check logs error but exits with 0", () => {
    runCli("cli/infer-parser/", ["--check"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("--list-different logs error but exits with 0", () => {
    runCli("cli/infer-parser/", ["--list-different"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });
});

describe("stdin with unknown path and no parser", () => {
  describe("logs error and exits with 2", () => {
    runCli("cli/infer-parser/", ["--stdin-filepath", "foo"], {
      input: "foo",
    }).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("--check logs error but exits with 0", () => {
    runCli("cli/infer-parser/", ["--check", "--stdin-filepath", "foo"], {
      input: "foo",
    }).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });

  describe("--list-different logs error but exits with 0", () => {
    runCli(
      "cli/infer-parser/",
      ["--list-different", "--stdin-filepath", "foo"],
      { input: "foo" },
    ).test({
      status: 0,
      stdout: "",
      write: [],
    });
  });
});

describe("unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--end-of-line", "lf", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--end-of-line", "lf", "*"]).test({
      status: 2,
      write: [],
    });
  });
});

describe("--check with unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--check", "FOO"]).test({
      status: 2,
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--check", "*"]).test({
      status: 2,
      write: [],
    });
  });
});

describe("--list-different with unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--list-different", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--list-different", "*"]).test({
      status: 2,
      stdout: "foo.js",
      write: [],
    });
  });
});

describe("--write with unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--write", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--write", "*"]).test({
      status: 2,
    });
  });
});

describe("--write and --check with unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--check", "--write", "FOO"]).test({
      status: 2,
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--check", "--write", "*"]).test({
      status: 2,
    });
  });
});

describe("--write and --list-different with unknown path and no parser", () => {
  describe("specific file", () => {
    runCli("cli/infer-parser/", ["--list-different", "--write", "FOO"]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });

  describe("multiple files", () => {
    runCli("cli/infer-parser/", ["--list-different", "--write", "*"]).test({
      status: 2,
    });
  });
});

describe("API with no path and no parser", () => {
  test("prettier.format", async () => {
    await expect(prettier.format(" foo  (  )")).rejects.toThrow(
      /No parser and no file path given, couldn't infer a parser\./u,
    );
  });

  test("prettier.check", async () => {
    await expect(prettier.check(" foo (  )")).rejects.toThrow(
      /No parser and no file path given, couldn't infer a parser\./u,
    );
  });
});

describe("Known/Unknown", () => {
  runCli("cli/infer-parser/known-unknown", [
    "--end-of-line",
    "lf",
    "--list-different",
    ".",
  ]).test({
    status: 1,
    stderr: "",
    write: [],
  });
});

describe("Interpreters", () => {
  runCli("cli/infer-parser/interpreters", ["--file-info", "zx-script"]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("isSupported", () => {
  runCli("cli/infer-parser", [
    "--plugin",
    "../../plugins/languages/is-supported.js",
    "--file-info",
    ".husky/pre-commit",
  ]).test({
    status: 0,
    stderr: "",
    write: [],
  });

  runCli("cli/infer-parser", [
    "--plugin",
    "../../plugins/languages/is-supported.js",
    ".husky/pre-commit",
  ]).test({
    status: 0,
    stderr: "",
    write: [],
  });

  runCli(
    "cli/infer-parser",
    [
      "--plugin",
      "../../plugins/languages/is-supported.js",
      "--stdin-filepath",
      ".husky/pre-commit",
    ],
    { input: "content from stdin" },
  ).test({
    status: 0,
    stderr: "",
    write: [],
  });

  test("API", async () => {
    const fileUrl = new URL("foo.unknown", import.meta.url);
    const filePath = url.fileURLToPath(fileUrl);
    expect(await getIsSupportedReceivedFilepath({ filepath: fileUrl })).toBe(
      filePath,
    );
    expect(
      await getIsSupportedReceivedFilepath({ filepath: fileUrl.href }),
    ).toBe(filePath);
    expect(await getIsSupportedReceivedFilepath({ filepath: filePath })).toBe(
      filePath,
    );

    // Relative path
    expect(
      await getIsSupportedReceivedFilepath({ filepath: "./foo.unknown" }),
    ).toBe("./foo.unknown");

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: "",
      }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: Buffer.from("foo.unknown"),
      }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: { toString: () => "foo.unknown" },
      }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: new (class {
          toString() {
            return "foo.unknown";
          }
        })(),
      }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({ filepath: "file://%0" }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: new URL("https://example.com/foo.unknown"),
      }),
    ).toBeUndefined();

    expect(
      await getIsSupportedReceivedFilepath({
        filepath: "https://example.com/foo.unknown",
      }),
    ).toBe("https://example.com/foo.unknown");
  });
});

const getIsSupportedReceivedFilepath = async (options) => {
  let received;
  try {
    await prettier.format("foo", {
      plugins: [
        {
          languages: [
            {
              isSupported({ filepath }) {
                received = filepath;
              },
            },
          ],
        },
      ],
      ...options,
    });
  } catch (error) {
    if (error.name !== "UndefinedParserError") {
      throw error;
    }
  }
  return received;
};
