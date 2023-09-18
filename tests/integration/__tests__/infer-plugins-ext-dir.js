import { outdent } from "outdent";

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
      stdout: "src/file.bar 0ms\nsrc/file.foo 0ms",
      write: [
        {
          content: "!contents\n",
          filename: "src/file.bar",
        },
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
      "--no-editorconfig",
      "src",
    ]).test({
      status: 0,
      stdout: "src/file.foo 0ms\nsrc/index.js 0ms",
      write: [
        {
          content: '{"tabWidth":8,"bracketSpacing":false}',
          filename: "src/file.foo",
        },
        {
          // formatted with `tabWidth: 2`
          content: outdent`
            function main() {
              console.log("Hello, World!");
            }\n
          `,
          filename: "src/index.js",
        },
      ],
    });
  });
});
