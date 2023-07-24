describe("infer file ext that supported by only plugins", () => {
  runCli("cli/infer-plugins-ext-dir/", ["--write", "src"]).test({
    status: 0,
    stdout: "src/file.foo 0ms",
    write: [],
  });
});
