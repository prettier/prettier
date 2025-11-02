import fs from "node:fs/promises";
import path from "node:path";
import createEsmUtils from "esm-utils";
import fastGlob from "fast-glob";
import coreOptions from "../../../src/main/core-options.evaluate.js";
import codeSamples from "../../../website/playground/codeSamples.mjs";
import prettier from "../../config/prettier-entry.js";
import createSandBox from "../../config/utils/create-sandbox.cjs";
import { projectRoot } from "../env.js";

const { require, importModule } = createEsmUtils(import.meta);

const parserNames = coreOptions.parser.choices.map(({ value }) => value);
const distDirectory = path.join(projectRoot, "dist/prettier");

// Files including U+FFEE can't load in Chrome Extension
// `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
// details https://github.com/prettier/prettier/pull/8534
test("code", async () => {
  const files = await fastGlob(["**/*"], {
    cwd: distDirectory,
    absolute: true,
  });

  for (const file of files) {
    const text = await fs.readFile(file, "utf8");
    expect(text.includes("\ufffe")).toBe(false);
  }
});

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = fastGlob
    .sync(["plugins/*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  let esmStandalone;
  let esmPlugins;
  beforeAll(async () => {
    esmStandalone = await importModule(
      path.join(distDirectory, "standalone.mjs"),
    );
    esmPlugins = await Promise.all(
      fastGlob
        .sync(["plugins/*.mjs"], { cwd: distDirectory, absolute: true })
        .map(async (file) => {
          const plugin = await importModule(file);
          return plugin.default ?? plugin;
        }),
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
  const files = await fastGlob(["standalone.js", "plugins/*.js"], {
    cwd: distDirectory,
    absolute: true,
  });

  const allowedGlobalObjects = new Set(["prettier", "prettierPlugins"]);
  const getGlobalObjects = (file) => {
    const sandbox = createSandBox({ files: [file] });
    return Object.fromEntries(
      Object.entries(sandbox).filter(
        ([property]) => !allowedGlobalObjects.has(property),
      ),
    );
  };

  for (const file of files) {
    const globalObjects = getGlobalObjects(file);

    expect(globalObjects).toStrictEqual({});
  }
});

test("Commonjs version", () => {
  const prettierCommonjsVersion = require(
    path.join(distDirectory, "index.cjs"),
  );

  expect(Object.keys(prettierCommonjsVersion).sort()).toEqual(
    Object.keys(prettier)
      .filter((key) => key !== "default" && key !== "__internal")
      .sort(),
  );
  expect(typeof prettierCommonjsVersion.format).toBe("function");

  expect(Object.keys(prettierCommonjsVersion.doc)).toEqual(
    Object.keys(prettier.doc).filter((key) => key !== "default"),
  );
  expect(typeof prettierCommonjsVersion.doc.builders.fill).toBe("function");

  expect(Object.keys(prettierCommonjsVersion.util)).toEqual(
    Object.keys(prettier.util),
  );
  expect(typeof prettierCommonjsVersion.util.getStringWidth).toBe("function");

  expect(Object.keys(prettierCommonjsVersion.__debug).sort()).toEqual(
    Object.keys(prettier.__debug)
      .filter((key) => key !== "mockable")
      .sort(),
  );
  expect(typeof prettierCommonjsVersion.__debug.parse).toBe("function");

  expect(prettierCommonjsVersion.version).toBe(prettier.version);
});
