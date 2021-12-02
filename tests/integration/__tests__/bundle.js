import path from "node:path";
import globby from "globby";
import createEsmUtils from "esm-utils";
import { projectRoot } from "../env.js";
import coreOptions from "../../../src/main/core-options.js";
import codeSamples from "../../../website/playground/codeSamples.mjs";
import jestPathSerializer from "../path-serializer.js";

const { require } = createEsmUtils(import.meta);

expect.addSnapshotSerializer(jestPathSerializer);

const parserNames = coreOptions.options.parser.choices.map(
  ({ value }) => value
);
const distDirectory = path.join(projectRoot, "dist");

let esmStandalone;
let esmPlugins;
beforeAll(async () => {
  ({ default: esmStandalone } = await import(
    path.join(distDirectory, "esm/standalone.mjs")
  ));
  esmPlugins = await Promise.all(
    globby
      .sync(["esm/parser-*.mjs"], { cwd: distDirectory, absolute: true })
      .map(async (file) => (await import(file)).default)
  );
});

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = globby
    .sync(["parser-*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  for (const parser of parserNames) {
    test(parser, () => {
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
