import { outdent } from "outdent";

const TAB_WIDTH_3_OUTPUT = outdent`
  function foo() {
  ${" ".repeat(3)}return bar;
  }
`;
const TAB_WIDTH_5_OUTPUT = outdent`
  function foo() {
  ${" ".repeat(5)}return bar;
  }
`;

test("CLI overrides take precedence --config-precedence", async () => {
  const withoutFlag = await runCli("cli/config-precedence/valid-config", [
    "foo.js",
  ]).stdout;
  expect(withoutFlag).toBe(TAB_WIDTH_3_OUTPUT);

  const withFlag = await runCli("cli/config-precedence/valid-config", [
    "--tab-width",
    "5",
    "foo.js",
  ]).stdout;
  expect(withFlag).toBe(TAB_WIDTH_5_OUTPUT);
});

test("CLI overrides take precedence with --config-precedence cli-override", async () => {
  const withoutFlag = await runCli("cli/config-precedence/valid-config", [
    "--config-precedence",
    "cli-override",
    "foo.js",
  ]).stdout;
  expect(withoutFlag).toBe(TAB_WIDTH_3_OUTPUT);

  const withFlag = await runCli("cli/config-precedence/valid-config", [
    "--config-precedence",
    "cli-override",
    "--tab-width",
    "5",
    "foo.js",
  ]).stdout;
  expect(withFlag).toBe(TAB_WIDTH_5_OUTPUT);
});

test("CLI overrides take lower precedence with --config-precedence file-override", async () => {
  const withoutFlag = await runCli("cli/config-precedence/valid-config", [
    "--config-precedence",
    "file-override",
    "foo.js",
  ]).stdout;
  expect(withoutFlag).toBe(TAB_WIDTH_3_OUTPUT);

  const withFlag = await runCli("cli/config-precedence/valid-config", [
    "--config-precedence",
    "file-override",
    "--tab-width",
    "5",
    "foo.js",
  ]).stdout;
  expect(withFlag).toBe(TAB_WIDTH_3_OUTPUT);
});

describe("CLI overrides are still applied when no config is found with --config-precedence file-override", () => {
  runCli("cli/config/no-config/", [
    "--end-of-line",
    "lf",
    "--tab-width",
    "6",
    "--config-precedence",
    "file-override",
    "file.js",
    "--no-editorconfig",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides gets ignored when config exists with --config-precedence prefer-file", () => {
  runCli("cli/config/js/", [
    "--print-width",
    "1",
    "--tab-width",
    "1",
    "--config-precedence",
    "prefer-file",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("CLI overrides gets applied when no config exists with --config-precedence prefer-file", () => {
  runCli("cli/config/no-config/", [
    "--end-of-line",
    "lf",
    "--print-width",
    "1",
    "--tab-width",
    "7",
    "--no-config",
    "--config-precedence",
    "prefer-file",
    "file.js",
  ]).test({
    status: 0,
  });
});

describe("CLI validate options with --config-precedence cli-override", () => {
  runCli("cli/config-precedence/invalid-config", [
    "--config-precedence",
    "cli-override",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI validate options with --config-precedence file-override", () => {
  runCli("cli/config-precedence/invalid-config", [
    "--config-precedence",
    "file-override",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI validate options with --config-precedence prefer-file", () => {
  runCli("cli/config-precedence/invalid-config", [
    "--config-precedence",
    "prefer-file",
  ]).test({
    status: "non-zero",
  });
});

describe("CLI --stdin-filepath works with --config-precedence prefer-file", () => {
  runCli(
    "cli/config-precedence/overrides",
    ["--stdin-filepath=abc.ts", "--no-semi", "--config-precedence=prefer-file"],
    { input: "let x: keyof Y = foo<typeof X>()" }, // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});

describe("CLI --stdin-filepath works with --config-precedence file-override", () => {
  runCli(
    "cli/config-precedence/overrides",
    [
      "--stdin-filepath=abc.ts",
      "--no-semi",
      "--config-precedence=file-override",
    ],
    { input: "let x: keyof Y = foo<typeof X>()" }, // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});

describe("CLI --stdin-filepath works with --config-precedence cli-override", () => {
  runCli(
    "cli/config-precedence/overrides",
    [
      "--stdin-filepath=abc.ts",
      "--no-semi",
      "--config-precedence=cli-override",
    ],
    { input: "let x: keyof Y = foo<typeof X>()" }, // typescript
  ).test({
    stderr: "",
    status: 0,
  });
});
