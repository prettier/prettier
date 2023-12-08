describe("plugin default options should work", () => {
  runCli(
    "plugins/defaultOptions",
    [
      "--stdin-filepath",
      "example.foo",
      "--plugin=./plugin.cjs",
      "--no-editorconfig",
    ],
    { input: "hello-world" },
  ).test({
    stdout: JSON.stringify({
      tabWidth: 8,
      bracketSpacing: false,
    }),
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("overriding plugin default options should work", () => {
  runCli(
    "plugins/defaultOptions",
    [
      "--stdin-filepath",
      "example.foo",
      "--plugin=./plugin.cjs",
      "--tab-width=4",
    ],
    { input: "hello-world" },
  ).test({
    stdout: JSON.stringify({
      tabWidth: 4,
      bracketSpacing: false,
    }),
    stderr: "",
    status: 0,
    write: [],
  });
});
