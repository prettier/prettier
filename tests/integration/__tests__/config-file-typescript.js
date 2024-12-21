import { outdent } from "outdent";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

const NODE_TS_SUPPORT_FLAGS = ["--experimental-strip-types"];
const IS_SUPPORTED_NODE_JS = Number(process.versions.node.split(".")[0]) >= 22;

const getOutputTabWidth = (code) =>
  code.match(/\n(?<indention>\s+)return/u).groups.indention.length;
const code = "function foo() {return bar}";

const TAB_WIDTH_3_OUTPUT = outdent`
  function foo() {
  ${" ".repeat(3)}return bar;
  }
`;

if (IS_SUPPORTED_NODE_JS) {
  test("Should support typescript config files", async () => {
    const output = await runCli(
      "cli/config/ts/auto-discovery/",
      ["--stdin-filepath", "foo.js"],
      {
        input: code,
        nodeOptions: NODE_TS_SUPPORT_FLAGS,
      },
    ).stdout;

    expect(output).toBe(TAB_WIDTH_3_OUTPUT);
  });

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
            nodeOptions: NODE_TS_SUPPORT_FLAGS,
          },
        ).stdout;

        expect(getOutputTabWidth(output)).toBe(expectedTabWidth);
      });
    }
  });
} else {
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
