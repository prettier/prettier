import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { temporaryDirectory as getTemporaryDirectory } from "tempy";
import loadConfig from "../../src/config/prettier-config/load-config.js";
import createPathSerializer from "../integration/create-path-serializer.js";

const directory = getTemporaryDirectory();
expect.addSnapshotSerializer(
  createPathSerializer({
    replacements: new Map([[url.pathToFileURL(directory + "/"), "<dir>/"]]),
  }),
);

async function loadConfigFile({ filename, content }) {
  const file = path.join(directory, filename);
  await fs.writeFile(file, content);
  return await loadConfig(file);
}

describe("Invalid configs", () => {
  afterAll(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  test("throw error for unsupported extension", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc.unsupported", content: "{}" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"No loader specified for extension ".unsupported""`,
    );
  });

  test("throw error with invalid config format", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc", content: "--invalid--" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot find package '--invalid--' imported from <dir>/.prettierrc"`,
    );
  });

  test("throw error with invalid config format", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc", content: "1" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Config is only allowed to be an object, but received number in "<dir>/.prettierrc""`,
    );
  });

  // #8815, please make sure this error contains code frame
  test("Invalid JSON file", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc.json", content: "{a':}" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
"JSON Error in <dir>/.prettierrc.json:
Expected property name or '}' in JSON at position 1 (line 1 column 2)

> 1 | {a':}
    |  ^


> 1 | {a':}
    |  ^

Cause: Expected property name or '}' in JSON at position 1 (line 1 column 2)"
`);
  });

  test("Invalid TOML file", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc.toml", content: "a=\n  b!=" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
"TOML Error in <dir>/.prettierrc.toml:
Invalid TOML document: incomplete declaration: value expected

1:  a=
      ^
2:    b!=
"
`);
  });

  test("Invalid YAML file", async () => {
    await expect(() =>
      loadConfigFile({ filename: ".prettierrc.yaml", content: "a:\na:" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
"YAML Error in <dir>/.prettierrc.yaml:
Map keys must be unique at line 1, column 3:

a:
  ^
"
`);
  });
});
