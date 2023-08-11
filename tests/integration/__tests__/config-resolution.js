import path from "node:path";
import createEsmUtils from "esm-utils";
import prettier from "../../config/prettier-entry.js";

const { __dirname } = createEsmUtils(import.meta);

test("resolves configuration from external files and overrides by extname", async () => {
  await expect(
    prettier.resolveConfig(
      path.join(__dirname, "../cli/config/external-overrides/file.js"),
    ),
  ).resolves.toEqual({ tabWidth: 3, semi: false });
  await expect(
    prettier.resolveConfig(
      path.join(__dirname, "../cli/config/external-overrides/file.ts"),
    ),
  ).resolves.toEqual({ tabWidth: 3, semi: true });
});

describe("accepts configuration from --config", () => {
  runCli("cli/config/", ["--config", ".prettierrc", "./js/file.js"]).test({
    status: 0,
  });
});

describe("resolves external configuration from package.json (cjs package)", () => {
  runCli("cli/config/external-config/cjs-package", ["index.js"]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("resolves external configuration from package.json (esm package)", () => {
  runCli("cli/config/external-config/esm-package", ["index.js"]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("resolves external configuration from package.json (esm file)", () => {
  runCli("cli/config/external-config/esm-package", ["index.js"]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("resolves configuration file with --find-config-path file", () => {
  runCli("cli/config/", ["--find-config-path", "no-config/file.js"]).test({
    status: 0,
  });
});

describe("resolves json configuration file with --find-config-path file", () => {
  runCli("cli/config/", ["--find-config-path", "rc-json/file.js"]).test({
    status: 0,
  });
});

describe("resolves yaml configuration file with --find-config-path file", () => {
  runCli("cli/config/", ["--find-config-path", "rc-yaml/file.js"]).test({
    status: 0,
  });
});

describe("resolves toml configuration file with --find-config-path file", () => {
  runCli("cli/config/", ["--find-config-path", "rc-toml/file.js"]).test({
    status: 0,
  });
});

describe("prints error message when no file found with --find-config-path", () => {
  runCli("cli/config/", [
    "--end-of-line",
    "lf",
    "--find-config-path",
    "..",
  ]).test({
    stdout: "",
    status: 1,
  });
});

test("API resolveConfig with no args", async () => {
  await expect(prettier.resolveConfig()).resolves.toEqual({});
});

test("API resolveConfig with file arg", async () => {
  const file = path.resolve(path.join(__dirname, "../cli/config/js/file.js"));
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 8,
  });
});

test("API resolveConfig with file arg and extension override", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/no-config/file.ts"),
  );
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: true,
  });
});

test("API resolveConfig with file arg and .editorconfig", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/file.js"),
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true }),
  ).resolves.toMatchObject({
    useTabs: true,
    tabWidth: 8,
    printWidth: 100,
  });
});

test("API resolveConfig with file arg and .editorconfig (key = unset)", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/tab_width=unset.js"),
  );

  await expect(
    prettier.resolveConfig(file, { editorconfig: true }),
  ).resolves.not.toMatchObject({ tabWidth: "unset" });
});

test("API resolveConfig with nested file arg and .editorconfig", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/file.js"),
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true }),
  ).resolves.toMatchObject({
    useTabs: false,
    tabWidth: 2,
    printWidth: 100,
  });
});

test("API resolveConfig with nested file arg and .editorconfig and indent_size = tab", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/editorconfig/lib/indent_size=tab.js"),
  );

  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: false,
  });

  await expect(
    prettier.resolveConfig(file, { editorconfig: true }),
  ).resolves.toMatchObject({
    useTabs: false,
    tabWidth: 8,
    printWidth: 100,
  });
});

test("API clearConfigCache", () => {
  expect(() => prettier.clearConfigCache()).not.toThrowError();
});

test("API resolveConfig overrides work with dotfiles", async () => {
  const folder = path.join(__dirname, "../cli/config/dot-overrides");
  await expect(
    prettier.resolveConfig(path.join(folder, ".foo.json")),
  ).resolves.toMatchObject({
    tabWidth: 4,
  });
});

test("API resolveConfig overrides work with absolute paths", async () => {
  // Absolute path
  const file = path.join(__dirname, "../cli/config/filepath/subfolder/file.js");
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 6,
  });
});

test("API resolveConfig overrides excludeFiles", async () => {
  const notOverride = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/foo",
  );
  await expect(prettier.resolveConfig(notOverride)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "all",
  });

  const singleQuote = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/single-quote.js",
  );
  await expect(prettier.resolveConfig(singleQuote)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "es5",
  });

  const doubleQuote = path.join(
    __dirname,
    "../cli/config/overrides-exclude-files/double-quote.js",
  );
  await expect(prettier.resolveConfig(doubleQuote)).resolves.toMatchObject({
    singleQuote: false,
    trailingComma: "es5",
  });
});

test("API resolveConfig removes $schema option", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/config/$schema/index.js"),
  );
  await expect(prettier.resolveConfig(file)).resolves.toEqual({
    tabWidth: 42,
  });
});

test("API resolveConfig resolves relative path values based on config filepath", async () => {
  const currentDir = path.join(__dirname, "../cli/config/resolve-relative");
  const parentDir = path.resolve(currentDir, "..");
  await expect(
    prettier.resolveConfig(`${currentDir}/index.js`),
  ).resolves.toMatchObject({
    plugins: [path.join(parentDir, "path-to-plugin")],
  });
});

test("API resolveConfig de-references to an external module", async () => {
  const config = { printWidth: 77, semi: false };
  await expect(
    prettier.resolveConfig(
      path.join(
        __dirname,
        "../cli/config/external-config/cjs-package/index.js",
      ),
    ),
  ).resolves.toEqual(config);
  await expect(
    prettier.resolveConfig(
      path.join(
        __dirname,
        "../cli/config/external-config/esm-package/index.js",
      ),
    ),
  ).resolves.toEqual(config);
  await expect(
    prettier.resolveConfig(
      path.join(__dirname, "../cli/config/external-config/esm-file/index.js"),
    ),
  ).resolves.toEqual(config);
});

test(".js config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-js");

  const config = {
    trailingComma: "all",
    singleQuote: true,
  };

  for (const directoryName of [
    "cjs-prettier-config-js-in-type-commonjs",
    "cjs-prettier-config-js-in-type-none",
    "cjs-prettierrc-js-in-type-commonjs",
    "cjs-prettierrc-js-in-type-none",
    "mjs-prettier-config-js-in-type-module",
    "mjs-prettierrc-js-in-type-module",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }

  const cjsError = /module is not defined in ES module scope/;
  for (const directoryName of [
    "cjs-prettier-config-js-in-type-module",
    "cjs-prettierrc-js-in-type-module",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");
    await expect(prettier.resolveConfig(file)).rejects.toThrow(cjsError);
  }

  const mjsError = /Unexpected token 'export'/;
  for (const directoryName of [
    "mjs-prettier-config-js-in-type-commonjs",
    "mjs-prettier-config-js-in-type-none",
    "mjs-prettierrc-js-in-type-commonjs",
    "mjs-prettierrc-js-in-type-none",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");
    await expect(prettier.resolveConfig(file)).rejects.toThrow(mjsError);
  }
});

test(".cjs config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-cjs");

  const config = {
    trailingComma: "all",
    singleQuote: true,
  };

  for (const directoryName of [
    "prettierrc-cjs-in-type-module",
    "prettierrc-cjs-in-type-commonjs",
    "prettierrc-cjs-in-type-none",
    "prettier-config-cjs-in-type-commonjs",
    "prettier-config-cjs-in-type-none",
    "prettier-config-cjs-in-type-module",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }
});

test(".mjs config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-mjs");

  const config = {
    trailingComma: "all",
    singleQuote: true,
  };

  for (const directoryName of [
    "prettierrc-mjs-in-type-module",
    "prettierrc-mjs-in-type-commonjs",
    "prettierrc-mjs-in-type-none",
    "prettier-config-mjs-in-type-commonjs",
    "prettier-config-mjs-in-type-none",
    "prettier-config-mjs-in-type-module",
  ]) {
    const file = path.join(parentDirectory, directoryName, "foo.js");
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }
});

test(".json5 config file", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-json5");
  const config = {
    trailingComma: "all",
    printWidth: 81,
    tabWidth: 3,
  };
  const file = path.join(parentDirectory, "json5/foo.js");
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
});

test(".json5 config file(invalid)", async () => {
  const parentDirectory = path.join(__dirname, "../cli/config/rc-json5");
  const file = path.join(parentDirectory, "invalid/foo.js");
  const error = /JSON5: invalid end of input at 2:1/;
  await expect(prettier.resolveConfig(file)).rejects.toThrow(error);
});
