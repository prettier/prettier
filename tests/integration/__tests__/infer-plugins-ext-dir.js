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

  describe("with overrides and defaultOptions", () => {
    runCli("cli/infer-plugins-ext-dir-with-overrides-and-default-options/", [
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

  describe("with multiple config for nested dir", () => {
    runCli("cli/infer-plugins-with-multiple-config", [
      "--write",
      "--no-editorconfig",
      ".",
    ]).test({
      status: 0,
      stdout: outdent`
        dir/.prettierrc.mjs 0ms
        dir/subdir/.prettierrc.mjs 0ms
        dir/subdir/2.foo 0ms
      `,
      write: [
        {
          content: "export default {};\n",
          filename: "dir/.prettierrc.mjs",
        },
        {
          content: outdent`
            export default {
              plugins: ["../../../../plugins/defaultOptions/plugin.cjs"],
            };\n
          `,
          filename: "dir/subdir/.prettierrc.mjs",
        },
        {
          content: '{"tabWidth":8,"bracketSpacing":false}',
          filename: "dir/subdir/2.foo",
        },
      ],
    });
  });

  describe("with multiple config for nested dir 2", () => {
    runCli("cli/infer-plugins-with-multiple-config", [
      "--write",
      "--no-editorconfig",
      "dir",
      "dir/subdir",
    ]).test({
      status: 0,
      stdout: outdent`
        dir/.prettierrc.mjs 0ms
        dir/subdir/.prettierrc.mjs 0ms
        dir/subdir/2.foo 0ms
      `,
      write: [
        {
          content: "export default {};\n",
          filename: "dir/.prettierrc.mjs",
        },
        {
          content: outdent`
            export default {
              plugins: ["../../../../plugins/defaultOptions/plugin.cjs"],
            };\n
          `,
          filename: "dir/subdir/.prettierrc.mjs",
        },
        {
          content: '{"tabWidth":8,"bracketSpacing":false}',
          filename: "dir/subdir/2.foo",
        },
      ],
    });
  });

  describe("with multiple config for nested dir 2", () => {
    runCli("cli/infer-plugins-ext-dir-with-complex-overrides", [
      "--write",
      "--no-editorconfig",
      ".",
    ]).test({
      status: 0,
      stdout: outdent`
        .prettierrc.mjs 0ms
        dir/2.foo 0ms
      `,
      write: [
        {
          content: outdent`
            export default {
              overrides: [
                {
                  files: ["dir/*.foo"],
                  options: {
                    plugins: ["../../plugins/extensions/plugin.cjs"],
                  },
                },
              ],
            };\n
          `,
          filename: ".prettierrc.mjs",
        },
        {
          content: "!2.foo\n",
          filename: "dir/2.foo",
        },
      ],
    });
  });
});
