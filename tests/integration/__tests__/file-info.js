import path from "node:path";
import fs from "node:fs";
import { temporaryDirectory as getTemporaryDirectory } from "tempy";
import createEsmUtils from "esm-utils";
import prettier from "../../config/prettier-entry.js";

const { __dirname } = createEsmUtils(import.meta);

describe("extracts file-info for a js file", () => {
  runCli("cli/", ["--file-info", "something.js"]).test({
    status: 0,
  });
});

describe("extracts file-info for a markdown file", () => {
  runCli("cli/", ["--file-info", "README.md"]).test({
    status: 0,
  });
});

describe("extracts file-info for a known markdown file with no extension", () => {
  runCli("cli/", ["--file-info", "README"]).test({
    status: 0,
  });
});

describe("extracts file-info with ignored=true for a file in .prettierignore", () => {
  runCli("cli/ignore-path/file-info-test/", [
    "--file-info",
    "ignored-by-prettierignore.js",
  ]).test({
    status: 0,
  });
});

describe("file-info should try resolve config", () => {
  runCli("cli/with-resolve-config/", ["--file-info", "file.js"]).test({
    status: 0,
  });
});

describe("file-info should not try resolve config with --no-config", () => {
  runCli("cli/with-resolve-config/", [
    "--file-info",
    "file.js",
    "--no-config",
  ]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("extracts file-info with ignored=true for a file in a hand-picked ignore file", () => {
  runCli("cli/", [
    "--file-info",
    "ignored-by-customignore.js",
    "--ignore-path=ignore-path/file-info-test/.customignore",
  ]).test({
    status: 0,
  });
});

describe("non-exists ignore path", () => {
  runCli("cli/", [
    "--file-info",
    "regular-module.js",
    "--ignore-path=ignore-path/file-info-test/.non-exists-ignore-file",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info for a file in not_node_modules", () => {
  runCli("cli/with-node-modules/", [
    "--file-info",
    "not_node_modules/file.js",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with with ignored=true for a file in node_modules", () => {
  runCli("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with ignored=false for a file in node_modules when --with-node-modules provided", () => {
  runCli("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js",
    "--with-node-modules",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=null for file.foo", () => {
  runCli("cli/", ["--file-info", "file.foo"]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=foo when a plugin is hand-picked", () => {
  runCli("cli/", [
    "--file-info",
    "file.foo",
    "--plugin",
    "../plugins/automatic/node_modules/@prettier/plugin-foo/index.js",
  ]).test({
    status: 0,
  });
});

test("API getFileInfo with no args", async () => {
  await expect(prettier.getFileInfo()).rejects.toThrow(
    new TypeError("expect `filePath` to be a string, got `undefined`"),
  );
});

test("API getFileInfo with filepath only", async () => {
  await expect(prettier.getFileInfo("README")).resolves.toMatchObject({
    ignored: false,
    inferredParser: "markdown",
  });
});

describe("API getFileInfo resolveConfig", () => {
  const files = Object.fromEntries(
    ["foo", "js", "bar", "css"].map((ext) => [
      ext,
      path.resolve(
        path.join(__dirname, `../cli/with-resolve-config/file.${ext}`),
      ),
    ]),
  );
  test("{resolveConfig: undefined}", async () => {
    await expect(prettier.getFileInfo(files.foo)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "foo-parser",
    });
    await expect(prettier.getFileInfo(files.js)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "override-js-parser",
    });
    await expect(prettier.getFileInfo(files.bar)).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(prettier.getFileInfo(files.css)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
  test("{resolveConfig: true}", async () => {
    await expect(
      prettier.getFileInfo(files.foo, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "foo-parser",
    });
    await expect(
      prettier.getFileInfo(files.js, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "override-js-parser",
    });
    await expect(
      prettier.getFileInfo(files.bar, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(
      prettier.getFileInfo(files.css, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
});

describe("API getFileInfo resolveConfig when no config is present", () => {
  const files = Object.fromEntries(
    ["foo", "js"].map((ext) => [
      ext,
      path.resolve(path.join(__dirname, `../cli/non-exists-dir/file.${ext}`)),
    ]),
  );
  test("{resolveConfig: undefined}", async () => {
    await expect(prettier.getFileInfo(files.foo)).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(prettier.getFileInfo(files.js)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
  test("{resolveConfig: true}", async () => {
    await expect(
      prettier.getFileInfo(files.foo, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(
      prettier.getFileInfo(files.js, { resolveConfig: true }),
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
});

test("API getFileInfo with ignorePath", async () => {
  const file = path.resolve(
    path.join(
      __dirname,
      "../cli/ignore-path/file-info-test/ignored-by-customignore.js",
    ),
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-path/file-info-test/.customignore"),
  );

  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });

  await expect(
    prettier.getFileInfo(file, { ignorePath }),
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});

test("API getFileInfo with ignorePath containing relative paths", async () => {
  const file = path.resolve(
    path.join(
      __dirname,
      "../cli/ignore-relative-path/level1-glob/level2-glob/level3-glob/shouldNotBeFormat.js",
    ),
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-relative-path/.prettierignore"),
  );

  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });

  await expect(
    prettier.getFileInfo(file, { ignorePath }),
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});

describe("API getFileInfo with ignorePath", () => {
  let cwd;
  let filePath;
  let options;
  beforeAll(() => {
    cwd = process.cwd();
    const tempDir = getTemporaryDirectory();
    process.chdir(tempDir);
    const fileDir = "src";
    filePath = `${fileDir}/should-be-ignored.js`;
    const ignorePath = path.join(tempDir, ".prettierignore");
    fs.writeFileSync(ignorePath, filePath, "utf8");
    options = { ignorePath };
  });
  afterAll(() => {
    process.chdir(cwd);
  });
  test("with relative filePath", async () => {
    const { ignored } = await prettier.getFileInfo(filePath, options);
    expect(ignored).toBe(true);
  });
  test("with relative filePath starts with dot", async () => {
    const { ignored } = await prettier.getFileInfo(`./${filePath}`, options);
    expect(ignored).toBe(true);
  });
  test("with absolute filePath", async () => {
    const { ignored } = await prettier.getFileInfo(
      path.resolve(filePath),
      options,
    );
    expect(ignored).toBe(true);
  });
});

test("API getFileInfo with withNodeModules", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/with-node-modules/node_modules/file.js"),
  );
  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
  await expect(
    prettier.getFileInfo(file, {
      withNodeModules: true,
    }),
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

test("extracts file-info for a JS file with no extension but a standard shebang", async () => {
  await expect(
    prettier.getFileInfo("tests/integration/cli/shebang/node-shebang"),
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

test("extracts file-info for a JS file with no extension but an env-based shebang", async () => {
  await expect(
    prettier.getFileInfo("tests/integration/cli/shebang/env-node-shebang"),
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

test("returns null parser for unknown shebang", async () => {
  await expect(
    prettier.getFileInfo("tests/integration/cli/shebang/nonsense-shebang"),
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: null,
  });
});

test("API getFileInfo with hand-picked plugins", async () => {
  const file = "file.foo";
  const pluginPath = path.resolve(
    path.join(
      __dirname,
      "../plugins/automatic/node_modules/@prettier/plugin-foo/index.js",
    ),
  );
  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: null,
  });
  await expect(
    prettier.getFileInfo(file, {
      plugins: [pluginPath],
    }),
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "foo",
  });
});

test("API getFileInfo with ignorePath and resolveConfig should infer parser with correct filepath", async () => {
  const dir = path.join(__dirname, "../cli/ignore-and-config/");
  const filePath = path.join(dir, "config-dir/foo");
  const ignorePath = path.join(dir, "ignore-path-dir/.prettierignore");
  const options = {
    resolveConfig: true,
    ignorePath,
  };

  await expect(prettier.getFileInfo(filePath, options)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "parser-for-config-dir",
  });
});
