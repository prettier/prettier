"use strict";

const path = require("path");
const globby = require("globby");
const { projectRoot } = require("../env.js");
const coreOptions = require("../../../src/main/core-options.js");

const parserNames = coreOptions.options.parser.choices.map(
  ({ value }) => value
);
const distDirectory = path.join(projectRoot, "dist");

let esmStandalone;
let esmPlugins;
let getCodeSamples;
beforeAll(async () => {
  ({ default: esmStandalone } = await import(
    path.join(distDirectory, "esm/standalone.mjs")
  ));
  esmPlugins = await Promise.all(
    globby
      .sync(["esm/parser-*.mjs"], { cwd: distDirectory, absolute: true })
      .map(async (file) => (await import(file)).default)
  );
  ({ default: getCodeSamples } = await import(
    "../../../website/playground/codeSamples.mjs"
  ));
});

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = globby
    .sync(["parser-*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  for (const parser of parserNames) {
    test(parser, () => {
      const input = getCodeSamples(parser);
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
