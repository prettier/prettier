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
