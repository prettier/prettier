import fs from "node:fs/promises";
import path from "node:path";
import { inspect } from "node:util";
import createEsmUtils from "esm-utils";
import fastGlob from "fast-glob";
import coreOptions from "../../../src/main/core-options.evaluate.js";
import codeSamples from "../../../website/playground/codeSamples.mjs";
import prettier from "../../config/prettier-entry.js";
import createSandBox from "../../config/utilities/create-sandbox.cjs";
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

  const printerVisitorKeysSettings = new Map([
    [
      "estree",
      {
        sharedVisitorKeys: true,
        nodes: [
          { type: "FunctionDeclaration" },
          { type: "FunctionExpression" },
        ],
      },
    ],
    [
      "estree-json",
      {
        sharedVisitorKeys: true,
        nodes: [{ type: "StringLiteral" }, { type: "Identifier" }],
      },
    ],
    [
      "glimmer",
      {
        sharedVisitorKeys: false,
        nodes: [{ type: "Template" }, { type: "Block" }],
      },
    ],
    [
      "graphql",
      {
        sharedVisitorKeys: false,
        nodes: [{ kind: "StringValue" }, { kind: "BooleanValue" }],
      },
    ],
    [
      "html",
      {
        sharedVisitorKeys: true,
        nodes: [{ kind: "comment" }, { kind: "cdata" }],
      },
    ],
    [
      "mdast",
      {
        sharedVisitorKeys: true,
        nodes: [{ type: "code" }, { type: "image" }],
      },
    ],
    [
      "postcss",
      {
        sharedVisitorKeys: true,
        nodes: [{ type: "media-query-list" }, { type: "selector-pseudo" }],
      },
    ],
    [
      "yaml",
      {
        sharedVisitorKeys: true,
        nodes: [{ type: "blockLiteral" }, { type: "quoteSingle" }],
      },
    ],
  ]);

  test("visitor keys with shared reference", () => {
    for (const [name, printer] of esmPlugins.flatMap((plugin) =>
      Object.entries(plugin.printers ?? {}),
    )) {
      try {
        expect(printerVisitorKeysSettings.has(name)).toBe(true);
      } catch {
        throw new Error(`Missing settings for printer '${name}'.`);
      }
      const { getVisitorKeys } = printer;
      expect(typeof getVisitorKeys).toBe("function");
      const { sharedVisitorKeys, nodes } = printerVisitorKeysSettings.get(name);
      expect(
        typeof sharedVisitorKeys === "boolean" &&
          Array.isArray(nodes) &&
          nodes.length > 1,
      ).toBe(true);
      const keys = nodes.map((node) => getVisitorKeys(node));

      try {
        expect(keys.every((keys) => Array.isArray(keys))).toBe(true);
      } catch {
        throw new Error(
          `Missing visitor keys for '${name}' nodes: ${inspect(nodes)}.`,
        );
      }
      const [firstNodeKeys, ...restNodeKeys] = keys;
      if (sharedVisitorKeys) {
        // Should be same reference
        expect(restNodeKeys.every((keys) => keys === firstNodeKeys)).toBe(true);
      } else {
        // Should be same, but not same reference
        expect(
          restNodeKeys.every(
            (keys) =>
              keys !== firstNodeKeys &&
              JSON.stringify(keys) === JSON.stringify(firstNodeKeys),
          ),
        ).toBe(true);
      }
    }
  });
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
