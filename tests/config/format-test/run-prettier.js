import fs from "node:fs";
import getPrettier from "../get-prettier.js";
import {
  CURSOR_PLACEHOLDER,
  isProduction,
  TEST_RUNTIME,
  TEST_STANDALONE,
} from "./constants.js";
import { replacePlaceholders } from "./replace-placeholders.js";
import { ensurePromise } from "./utilities.js";
import visualizeEndOfLine from "./visualize-end-of-line.js";

async function parse(source, options) {
  const prettier = await getPrettier();
  const { ast } = await ensurePromise(
    prettier.__debug.parse(source, await loadPlugins(options), {
      massage: true,
    }),
  );
  return ast;
}

async function format(originalText, originalOptions) {
  const { text: input, options } = replacePlaceholders(
    originalText,
    originalOptions,
  );
  const inputWithCursor = insertCursor(input, options.cursorOffset);
  const prettier = await getPrettier();

  const { formatted: output, cursorOffset } = await ensurePromise(
    prettier.formatWithCursor(input, await loadPlugins(options)),
  );
  const outputWithCursor = insertCursor(output, cursorOffset);
  const eolVisualizedOutput = visualizeEndOfLine(outputWithCursor);

  const changed = outputWithCursor !== inputWithCursor;

  return {
    changed,
    options,
    input,
    inputWithCursor,
    output,
    outputWithCursor,
    eolVisualizedOutput,
  };
}

const insertCursor = (text, cursorOffset) =>
  cursorOffset >= 0
    ? text.slice(0, cursorOffset) +
      CURSOR_PLACEHOLDER +
      text.slice(cursorOffset)
    : text;

// Move this to prettier installation
let externalParsers;
async function loadPlugins(options) {
  if (!isProduction || !options.parser || TEST_RUNTIME === "browser") {
    return options;
  }

  const { parser } = options;

  if (!externalParsers) {
    externalParsers = getExternalPlugins();
  }
  externalParsers = await externalParsers;
  if (!externalParsers.has(parser)) {
    return options;
  }
  const plugin = externalParsers.get(parser);

  const plugins = options.plugins ?? [];
  plugins.push(TEST_STANDALONE ? plugin.implementation : plugin.url);

  return { ...options, plugins };
}

async function getExternalPlugins() {
  const distDirectory = new URL("../../dist/", import.meta.url);
  const directories = fs.readdirSync(distDirectory);
  const plugins = await Promise.all(
    directories
      .filter((directory) => directory.startsWith("plugin-"))
      .map(async (directory) => {
        const url = new URL(`./${directory}/index.mjs`, distDirectory);
        const implementation = await import(url);
        return {
          url,
          implementation,
        };
      }),
  );
  const externalParsers = new Map();
  for (const plugin of plugins) {
    const { parsers } = plugin.implementation;
    if (parsers) {
      for (const parser of Object.keys(parsers)) {
        externalParsers.set(parser, plugin);
      }
    }
  }
  return externalParsers;
}

export { format, parse };
