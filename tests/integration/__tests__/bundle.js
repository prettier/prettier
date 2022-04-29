import fs from "node:fs";
import path from "node:path";
import createEsmUtils from "esm-utils";
import fastGlob from "fast-glob";
import { projectRoot } from "../env.js";
import createSandBox from "../../config/utils/create-sandbox.cjs";
import * as coreOptions from "../../../src/main/core-options.js";
import codeSamples from "../../../website/playground/codeSamples.mjs";
import jestPathSerializer from "../path-serializer.js";

const { require } = createEsmUtils(import.meta);

expect.addSnapshotSerializer(jestPathSerializer);

const parserNames = coreOptions.options.parser.choices.map(
  ({ value }) => value
);
const distDirectory = path.join(projectRoot, "dist");

// Files including U+FFEE can't load in Chrome Extension
// `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
// details https://github.com/prettier/prettier/pull/8534
test("code", async () => {
  const files = await fastGlob(["**/*"], {
    cwd: distDirectory,
    absolute: true,
  });

  for (const file of files) {
    const text = await fs.promises.readFile(file, "utf8");
    expect(text.includes("\ufffe")).toBe(false);
  }
});

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = fastGlob
    .sync(["parser-*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  let esmStandalone;
  let esmPlugins;
  beforeAll(async () => {
    ({ default: esmStandalone } = await import(
      path.join(distDirectory, "esm/standalone.mjs")
    ));
    esmPlugins = await Promise.all(
      fastGlob
        .sync(["esm/parser-*.mjs"], { cwd: distDirectory, absolute: true })
        .map(async (file) => (await import(file)).default)
    );
  });

  for (const parser of parserNames) {
    test(parser, async () => {
      const input = codeSamples(parser);
      const umdOutput = await standalone.format(input, {
        parser,
        plugins,
      });

      expect(typeof input).toBe("string");
      expect(typeof umdOutput).toBe("string");
      expect(umdOutput).not.toBe(input);

      const esmOutput = await esmStandalone.format(input, {
        parser,
        plugins: esmPlugins,
      });

      expect(esmOutput).toBe(umdOutput);
    });
  }
});

test("global objects", async () => {
  const files = await fastGlob(["standalone.js", "parser-*.js"], {
    cwd: distDirectory,
    absolute: true,
  });

  const allowedGlobalObjects = new Set(["prettier", "prettierPlugins"]);
  const getGlobalObjects = (file) => {
    const sandbox = createSandBox({ files: [file] });
    return Object.fromEntries(
      Object.entries(sandbox).filter(
        ([property]) => !allowedGlobalObjects.has(property)
      )
    );
  };

  for (const file of files) {
    const globalObjects = getGlobalObjects(file);

    expect(globalObjects).toStrictEqual({});
  }
});
