describe("automatically loads 'prettier-plugin-*'", () => {
  runCli("plugins/automatic", ["file.txt", "--parser=bar"]).test({
    stdout: "content from `prettier-plugin-bar` package + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads '@prettier/plugin-*'", () => {
  runCli("plugins/automatic", ["file.txt", "--parser=foo"]).test({
    stdout: "foo+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads '@<name>/prettier-plugin-*'", () => {
  runCli("plugins/automatic", ["file.txt", "--parser=foobar"]).test({
    stdout: "foobar+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads 'prettier-plugin-*' from --plugin-search-dir (same as autoload dir)", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=foo",
    "--plugin-search-dir=.",
  ]).test({
    stdout: "foo+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads '@prettier/plugin-*' from --plugin-search-dir (same as autoload dir)", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=bar",
    "--plugin-search-dir=.",
  ]).test({
    stdout: "content from `prettier-plugin-bar` package + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads '@<name>/prettier-plugin-*' from --plugin-search-dir (same as autoload dir)", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=foobar",
    "--plugin-search-dir=.",
  ]).test({
    stdout: "foobar+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads 'prettier-plugin-*' from --plugin-search-dir (different to autoload dir)", () => {
  runCli("plugins", [
    "automatic/file.txt",
    "--parser=foo",
    "--plugin-search-dir=automatic",
  ]).test({
    stdout: "foo+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("automatically loads '@prettier/plugin-*' from --plugin-search-dir (different to autoload dir)", () => {
  runCli("plugins", [
    "automatic/file.txt",
    "--parser=bar",
    "--plugin-search-dir=automatic",
  ]).test({
    stdout: "content from `prettier-plugin-bar` package + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("does not crash when --plugin-search-dir does not contain node_modules", () => {
  runCli(
    "plugins/extensions",
    [
      "file.foo",
      "--end-of-line",
      "lf",
      "--plugin=./plugin.cjs",
      "--plugin-search-dir=.",
    ],
    { ignoreLineEndings: true }
  ).test({
    stdout: "!contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("crashes when one of --plugin-search-dir does not exist", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=foo",
    "--plugin-search-dir=non-existing-dir",
    "--plugin-search-dir=.",
  ]).test({
    stdout: "",
    stderr: "[error] non-existing-dir does not exist or is not a directory",
    status: 1,
    write: [],
  });
});

describe("loads --plugin by its relative path", () => {
  runCli("plugins", [
    "automatic/file.txt",
    "--parser=bar",
    "--plugin=./automatic/node_modules/prettier-plugin-bar/index.js",
  ]).test({
    stdout: "content from `prettier-plugin-bar` package + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("loads --plugin by its relative path without leading ./", () => {
  runCli("plugins", [
    "automatic/file.txt",
    "--parser=bar",
    "--plugin=automatic/node_modules/prettier-plugin-bar/index.js",
  ]).test({
    stdout: "content from `prettier-plugin-bar` package + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("loads --plugin by package name", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=foobar",
    "--plugin=@user/prettier-plugin-foobar",
  ]).test({
    stdout: "foobar+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("loads --plugin by filename without leading ./, should resolve to file, not package", () => {
  runCli("plugins/automatic", [
    "file.txt",
    "--parser=baz",
    "--plugin=prettier-plugin-baz.js",
    "--no-plugin-search",
  ]).test({
    stdout: "content from `prettier-plugin-baz.js` file + contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("loads --plugin by bespoke plugin name (assuming it is installed in cwd)", () => {
  runCli("plugins/bespoke", [
    "../automatic/file.txt",
    "--parser=bespoke",
    "--plugin=@company/prettier-plugin-bespoke/main.js",
  ]).test({
    stdout: "bespoke+contents",
    stderr: "",
    status: 0,
    write: [],
  });
});

test("--no-plugin-search", async () => {
  async function getParser(args = []) {
    const { stdout } = await runCli("plugins/automatic", [
      "--file-info=file.foo",
      ...args,
    ]);
    return JSON.parse(stdout).inferredParser;
  }

  expect(await getParser()).toBe("foo");
  expect(await getParser(["--plugin-search-dir=."])).toBe("foo");
  expect(await getParser(["--no-plugin-search"])).toBeNull();
});

test("--no-plugin-search still allow use --plugin", async () => {
  const args = ["file.txt", "--parser=baz"];
  const { stdout: stdoutWithoutPlugin } = await runCli(
    "plugins/automatic",
    args
  );
  const argsWithPlugin = [...args, "--plugin=./prettier-plugin-baz.js"];
  const { stdout: stdoutWithPlugin } = await runCli(
    "plugins/automatic",
    argsWithPlugin
  );
  const { stdout: stdoutWithoutPluginAndNoPluginSearch } = await runCli(
    "plugins/automatic",
    [...args, "--no-plugin-search"]
  );
  const { stdout: stdoutWithPluginButNoPluginSearch } = await runCli(
    "plugins/automatic",
    [...argsWithPlugin, "--no-plugin-search"]
  );

  expect(stdoutWithoutPlugin).toBe(
    "content from `prettier-plugin-baz.js` package + contents"
  );
  expect(stdoutWithPlugin).toBe(
    "content from `prettier-plugin-baz.js` package + contents"
  );
  expect(stdoutWithoutPluginAndNoPluginSearch).toBe("");
  expect(stdoutWithPluginButNoPluginSearch).toBe(
    "content from `prettier-plugin-baz.js` file + contents"
  );
});

test("--no-plugin-search together with --plugin-search-dir", async () => {
  const result1 = await runCli("plugins/automatic", [
    "--no-plugin-search",
    "--plugin-search-dir",
  ]);
  const result2 = await runCli("plugins/automatic", [
    "--no-plugin-search",
    "--plugin-search-dir=foo",
  ]);
  const result3 = await runCli("plugins/automatic", [
    "--no-plugin-search",
    "--plugin-search-dir=foo",
    "--plugin-search-dir=bar",
  ]);

  expect(result1).toMatchInlineSnapshot(`
    {
      "status": 1,
      "stderr": "[error] Cannot use --no-plugin-search and --plugin-search-dir together.",
      "stdout": "",
      "write": [],
    }
  `);
  expect(result2).toEqual(result1);
  expect(result3).toEqual(result1);
});
