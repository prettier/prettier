describe("infer file ext that supported by only plugins", () => {
  describe("basic", () => {
    runCli("cli/infer-plugins-ext-dir/", ["--write", "src"]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [],
    });
  });

  describe("with config option", () => {
    runCli("cli/infer-plugins-ext-dir-with-config/", [
      "--config",
      "foo.mjs",
      "--write",
      "src",
    ]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [],
    });
  });

  describe("with overrides options", () => {
    runCli("cli/infer-plugins-ext-dir-with-overrides/", [
      "--write",
      "src",
    ]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [],
    });
  });
});
