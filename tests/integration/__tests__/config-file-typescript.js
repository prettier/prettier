import { outdent } from "outdent";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

const NODE_TS_SUPPORT_FLAGS = ["--experimental-strip-types"];
const NODE_JS_MAJOR_VERSION = Number(process.versions.node.split(".")[0]);

const getOutputTabWidth = (code) =>
  code.match(/\n(?<indention>\s+)return/u).groups.indention.length;
const code = "function foo() {return bar}";

const TAB_WIDTH_3_OUTPUT = outdent`
  function foo() {
  ${" ".repeat(3)}return bar;
  }
`;

// Node.js>=22 supports ts files, 22 requires experimental flag, 23 doesn't
if (NODE_JS_MAJOR_VERSION >= 22) {
  const nodeOptions = NODE_JS_MAJOR_VERSION === 22 ? NODE_TS_SUPPORT_FLAGS : [];

  test("Should support typescript config files", async () => {
    const output = await runCli(
      "cli/config/ts/auto-discovery/",
      ["--stdin-filepath", "foo.js"],
      {
        input: code,
        nodeOptions,
      },
    ).stdout;

    expect(output).toBe(TAB_WIDTH_3_OUTPUT);
  });

  describe("Config file names", () => {
    for (const { configFileName, expectedTabWidth } of [
      { configFileName: ".prettierrc.cts", expectedTabWidth: 8 },
      { configFileName: ".prettierrc.mts", expectedTabWidth: 3 },
      { configFileName: ".prettierrc.ts", expectedTabWidth: 4 },
      { configFileName: "prettier.config.cts", expectedTabWidth: 7 },
      { configFileName: "prettier.config.mts", expectedTabWidth: 6 },
      { configFileName: "prettier.config.ts", expectedTabWidth: 5 },
    ]) {
      test(`Should format file with tabWidth: ${expectedTabWidth} with config file '${configFileName}'.`, async () => {
        const output = await runCli(
          "cli/config/ts/config-file-names/",
          ["--stdin-filepath", "foo.js", "--config", configFileName],
          {
            input: code,
            nodeOptions,
          },
        ).stdout;

        expect(getOutputTabWidth(output)).toBe(expectedTabWidth);
      });
    }
  });
}

if (NODE_JS_MAJOR_VERSION === 22) {
  test("Should throw errors when flags are missing", async () => {
    await runCli(
      "cli/config/ts/auto-discovery/",
      ["--stdin-filepath", "foo.js"],
      { input: code },
    ).test({
      status: "non-zero",
      stdout: "",
      write: [],
      stderr: expect.stringMatching(/Unknown file extension ".ts" for/u),
    });
  });
}

if (NODE_JS_MAJOR_VERSION < 22) {
  test("Should throw errors when Node.js < 22", async () => {
    await runCli(
      "cli/config/ts/auto-discovery/",
      ["--stdin-filepath", "foo.js"],
      { input: code },
    ).test({
      status: "non-zero",
      stdout: "",
      write: [],
      stderr: expect.stringMatching(/Unknown file extension ".ts" for/u),
    });

    // https://github.com/nodejs/node/issues/41103
    await expect(() =>
      runCli("cli/config/ts/auto-discovery/", ["--stdin-filepath", "foo.js"], {
        input: code,
        nodeOptions: NODE_TS_SUPPORT_FLAGS,
      }),
    ).rejects.toThrow(
      /Initiated Worker with invalid execArgv flags: --experimental-strip-types/u,
    );
  });
}
