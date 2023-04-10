describe("ignores file name contains emoji", () => {
  runCli("cli/ignore-emoji", ["**/*.js", "-l"]).test({
    status: 1,
  });
});

describe("stdin", () => {
  runCli("cli/ignore-emoji", ["--stdin-filepath", "ignored/我的样式.css"], {
    input: ".name {                         display: none; }",
  }).test({
    status: 0,
  });
});
