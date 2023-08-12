describe("infer file ext that supported by only plugins", () => {
  describe("basic", () => {
    runCli("cli/infer-plugins-ext-dir/", ["--write", "src"]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [
        {
          content: "!contents\n",
          filename: "src/file.foo",
        },
      ],
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
      write: [
        {
          content: "!contents\n",
          filename: "src/file.foo",
        },
      ],
    });
  });

  describe("with overrides options", () => {
    runCli("cli/infer-plugins-ext-dir-with-overrides/", [
      "--write",
      "src",
    ]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [
        {
          content: "!contents\n",
          filename: "src/file.foo",
        },
      ],
    });
  });

  describe("with defaultOptions", () => {
    runCli("cli/infer-plugins-ext-dir-with-default-options/", [
      "--write",
      "src",
    ]).test({
      status: 0,
      stdout: "src/file.foo 0ms",
      write: [
        {
          content: '{"tabWidth":2,"bracketSpacing":false}',
          filename: "src/file.foo",
        },
      ],
    });
  });
});
