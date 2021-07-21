"use strict";

const path = require("path");
const globby = require("globby");
const { projectRoot } = require("../env.js");
const coreOptions = require("../../../src/main/core-options.js");
const codeSamples =
  require("../../../website/playground/codeSamples.js").default;

const parserNames = coreOptions.options.parser.choices.map(
  ({ value }) => value
);
const distDirectory = path.join(projectRoot, "dist");

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = globby
    .sync(["parser-*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  for (const parser of parserNames) {
    test(parser, async () => {
      const { default: esmStandalone } = await import(
        path.join(distDirectory, "esm/standalone.mjs")
      );

      const esmPlugins = await Promise.all(
        globby
          .sync(["esm/parser-*.mjs"], { cwd: distDirectory, absolute: true })
          .map(async (file) => (await import(file)).default)
      );

      const input = codeSamples(parser);
      const umdOutput = standalone.format(input, {
        parser,
        plugins,
      });

      expect(typeof input).toBe("string");
      expect(typeof umdOutput).toBe("string");
      expect(umdOutput).not.toBe(input);

      const esmOutput = esmStandalone.format(input, {
        parser,
        plugins: esmPlugins,
      });

      expect(esmOutput).toBe(umdOutput);
    });
  }
});
