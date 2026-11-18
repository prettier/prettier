describe("loads package-name plugins relative to the config file", () => {
  runCli("cli/config/plugins/relative-to-config", [
    "--write",
    "packages/app/file.dummy-toml",
  ]).test({
    status: 0,
    stdout: "packages/app/file.dummy-toml 0ms",
    write: [
      {
        filename: "packages/app/file.dummy-toml",
        content:
          "!!! Formatted by with 'dummy-toml-plugin-parser-name' parser\nhello\n",
      },
    ],
  });
});
