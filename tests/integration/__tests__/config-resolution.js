import path from "node:path";
import url from "node:url";

import prettier from "../../config/prettier-entry.js";

test("resolves configuration from external files and overrides by extname", async () => {
  await expect(
    prettier.resolveConfig(
      new URL("../cli/config/external-overrides/file.js", import.meta.url),
    ),
  ).resolves.toEqual({ tabWidth: 3, semi: false });
  await expect(
    prettier.resolveConfig(
      new URL("../cli/config/external-overrides/file.ts", import.meta.url),
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
    "../--non-exits-filename--",
  ]).test({
    stdout: "",
    status: 1,
  });
});

test("API resolveConfig with no args", async () => {
  await expect(prettier.resolveConfig()).resolves.toEqual({});
});

test("API resolveConfig with file arg", async () => {
  const file = new URL("../cli/config/js/file.js", import.meta.url);
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 8,
  });
});

test("API resolveConfig with file arg and extension override", async () => {
  const file = new URL("../cli/config/no-config/file.ts", import.meta.url);
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    semi: true,
  });
});

test("API resolveConfig with file arg and .editorconfig", async () => {
  const file = new URL("../cli/config/editorconfig/file.js", import.meta.url);
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
  const file = new URL(
    "../cli/config/editorconfig/tab_width=unset.js",
    import.meta.url,
  );
  await expect(
    prettier.resolveConfig(file, { editorconfig: true }),
  ).resolves.not.toMatchObject({ tabWidth: "unset" });
});

test("API resolveConfig with nested file arg and .editorconfig", async () => {
  const file = new URL(
    "../cli/config/editorconfig/lib/file.js",
    import.meta.url,
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
  const file = new URL(
    "../cli/config/editorconfig/lib/indent_size=tab.js",
    import.meta.url,
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
  expect(() => prettier.clearConfigCache()).not.toThrow();
});

test("API resolveConfig overrides work with dotfiles", async () => {
  const file = new URL(
    "../cli/config/dot-overrides/.foo.json",
    import.meta.url,
  );
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 4,
  });
});

test("API resolveConfig overrides work with absolute paths", async () => {
  // Absolute path
  const file = url.fileURLToPath(
    new URL("../cli/config/filepath/subfolder/file.js", import.meta.url),
  );
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    tabWidth: 6,
  });
});

test("API resolveConfig overrides excludeFiles", async () => {
  const notOverride = new URL(
    "../cli/config/overrides-exclude-files/foo",
    import.meta.url,
  );
  await expect(prettier.resolveConfig(notOverride)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "all",
  });

  const singleQuote = new URL(
    "../cli/config/overrides-exclude-files/single-quote.js",
    import.meta.url,
  );
  await expect(prettier.resolveConfig(singleQuote)).resolves.toMatchObject({
    singleQuote: true,
    trailingComma: "es5",
  });

  const doubleQuote = new URL(
    "../cli/config/overrides-exclude-files/double-quote.js",
    import.meta.url,
  );
  await expect(prettier.resolveConfig(doubleQuote)).resolves.toMatchObject({
    singleQuote: false,
    trailingComma: "es5",
  });
});

test("API resolveConfig removes $schema option", async () => {
  const file = new URL("../cli/config/$schema/index.js", import.meta.url);
  await expect(prettier.resolveConfig(file)).resolves.toEqual({
    tabWidth: 42,
  });
});

test("API resolveConfig resolves relative path values based on config filepath", async () => {
  const currentDir = new URL(
    "../cli/config/resolve-relative/",
    import.meta.url,
  );
  const parentDir = path.resolve(url.fileURLToPath(currentDir), "..");
  await expect(
    prettier.resolveConfig(new URL("index.js", currentDir)),
  ).resolves.toMatchObject({
    plugins: [path.join(parentDir, "path-to-plugin")],
  });
});

test("API resolveConfig de-references to an external module", async () => {
  const config = { printWidth: 77, semi: false };
  await expect(
    prettier.resolveConfig(
      new URL(
        "../cli/config/external-config/cjs-package/index.js",
        import.meta.url,
      ),
    ),
  ).resolves.toEqual(config);
  await expect(
    prettier.resolveConfig(
      new URL(
        "../cli/config/external-config/esm-package/index.js",
        import.meta.url,
      ),
    ),
  ).resolves.toEqual(config);
  await expect(
    prettier.resolveConfig(
      new URL(
        "../cli/config/external-config/esm-file/index.js",
        import.meta.url,
      ),
    ),
  ).resolves.toEqual(config);
});

test(".js config file", async () => {
  const parentDirectory = new URL("../cli/config/rc-js/", import.meta.url);

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
    const file = new URL(`${directoryName}/foo.js`, parentDirectory);
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }

  const cjsError = /module is not defined in ES module scope/;
  for (const directoryName of [
    "cjs-prettier-config-js-in-type-module",
    "cjs-prettierrc-js-in-type-module",
  ]) {
    const file = new URL(`./${directoryName}/foo.js`, parentDirectory);
    await expect(prettier.resolveConfig(file)).rejects.toThrow(cjsError);
  }

  const mjsError = /Unexpected token 'export'/;
  for (const directoryName of [
    "mjs-prettier-config-js-in-type-commonjs",
    "mjs-prettier-config-js-in-type-none",
    "mjs-prettierrc-js-in-type-commonjs",
    "mjs-prettierrc-js-in-type-none",
  ]) {
    const file = new URL(`./${directoryName}/foo.js`, parentDirectory);
    await expect(prettier.resolveConfig(file)).rejects.toThrow(mjsError);
  }
});

test(".cjs config file", async () => {
  const parentDirectory = new URL("../cli/config/rc-cjs/", import.meta.url);

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
    const file = new URL(`./${directoryName}/foo.js`, parentDirectory);
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }
});

test(".mjs config file", async () => {
  const parentDirectory = new URL("../cli/config/rc-mjs/", import.meta.url);

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
    const file = new URL(`./${directoryName}/foo.js`, parentDirectory);
    await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
  }
});

test(".json5 config file", async () => {
  const parentDirectory = new URL("../cli/config/rc-json5/", import.meta.url);
  const config = {
    trailingComma: "all",
    printWidth: 81,
    tabWidth: 3,
  };
  const file = new URL("./json5/foo.js", parentDirectory);
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject(config);
});

test(".json5 config file(invalid)", async () => {
  const parentDirectory = new URL("../cli/config/rc-json5/", import.meta.url);
  const file = new URL("./invalid/foo.js", parentDirectory);
  const error = /JSON5: invalid end of input at 2:1/;
  await expect(prettier.resolveConfig(file)).rejects.toThrow(error);
});

test("support external module with `module` only `exports`", async () => {
  const file = new URL(
    "../cli/config/external-config/esm-package-forbids-require/index.js",
    import.meta.url,
  );
  await expect(prettier.resolveConfig(file)).resolves.toMatchObject({
    printWidth: 79,
  });
});

test("API resolveConfig accepts path or URL", async () => {
  const fileUrl = new URL("../cli/config/js/file.js", import.meta.url);
  const expectedResult = { tabWidth: 8 };

  const resultByUrl = await prettier.resolveConfig(fileUrl);
  const resultByUrlHref = await prettier.resolveConfig(fileUrl.href);
  const resultByPath = await prettier.resolveConfig(url.fileURLToPath(fileUrl));
  const resultByRelativePath = await prettier.resolveConfig(
    path.relative(process.cwd(), url.fileURLToPath(fileUrl)),
  );
  expect(resultByUrl).toMatchObject(expectedResult);
  expect(resultByUrlHref).toMatchObject(expectedResult);
  expect(resultByPath).toMatchObject(expectedResult);
  expect(resultByRelativePath).toMatchObject(expectedResult);
});

test("Search from directory, not treat file as directory", async () => {
  // CLI
  const getConfigFileByCli = async (file) => {
    const { stdout: configFile } = await runCli("cli/config/config-position/", [
      "--find-config-path",
      file,
    ]);
    return configFile;
  };

  expect(await getConfigFileByCli("file.js")).toBe(".prettierrc");
  expect(await getConfigFileByCli("directory/file-in-child-directory.js")).toBe(
    "directory/.prettierrc",
  );

  // Api
  const directory = new URL("../cli/config/config-position/", import.meta.url);
  const getConfigFileByApi = async (file) => {
    const configFile = await prettier.resolveConfigFile(
      new URL(file, directory),
    );
    return url.pathToFileURL(configFile).href.slice(directory.href.length);
  };
  expect(await getConfigFileByApi("file.js")).toBe(".prettierrc");
  expect(await getConfigFileByApi("directory/file-in-child-directory.js")).toBe(
    "directory/.prettierrc",
  );
});

test("package.json/package.yaml", async () => {
  await expect(
    prettier.resolveConfig(
      new URL("../cli/config/package/file.js", import.meta.url),
    ),
  ).resolves.toMatchInlineSnapshot(`
    {
      "tabWidth": 3,
    }
  `);
  await expect(
    prettier.resolveConfig(
      new URL("../cli/config/package/file.ts", import.meta.url),
    ),
  ).resolves.toMatchInlineSnapshot(`
    {
      "tabWidth": 5,
    }
  `);
  await expect(
    prettier.resolveConfig(
      new URL("../cli/config/package-yaml/file.ts", import.meta.url),
    ),
  ).resolves.toMatchInlineSnapshot(`
    {
      "printWidth": 101,
    }
  `);
});
