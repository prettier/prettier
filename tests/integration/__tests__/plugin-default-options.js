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

describe("plugin array option with a default value should work (#19012)", () => {
  runCli(
    "plugins/array-option-default",
    [
      "--stdin-filepath",
      "example.foo",
      "--plugin=./plugin.cjs",
      "--no-editorconfig",
    ],
    { input: "hello-world" },
  ).test({
    stdout: JSON.stringify({ fooArrayOption: ["default-value"] }),
    stderr: "",
    status: 0,
    write: [],
  });
});

describe("overriding plugin array option should work", () => {
  runCli(
    "plugins/array-option-default",
    [
      "--stdin-filepath",
      "example.foo",
      "--plugin=./plugin.cjs",
      "--no-editorconfig",
      "--foo-array-option=custom-value",
    ],
    { input: "hello-world" },
  ).test({
    stdout: JSON.stringify({ fooArrayOption: ["custom-value"] }),
    stderr: "",
    status: 0,
    write: [],
  });
});
