import { createRequire } from "node:module";
import { ConfigError } from "../common/errors.js";

const require = createRequire(import.meta.url);

// Use defineProperties()/getOwnPropertyDescriptor() to prevent
// triggering the parsers getters.
const ownNames = Object.getOwnPropertyNames;
const ownDescriptor = Object.getOwnPropertyDescriptor;
function getParsers(options) {
  const parsers = {};
  for (const plugin of options.plugins) {
    // TODO: test this with plugins
    /* istanbul ignore next */
    if (!plugin.parsers) {
      continue;
    }

    for (const name of ownNames(plugin.parsers)) {
      Object.defineProperty(parsers, name, ownDescriptor(plugin.parsers, name));
    }
  }

  return parsers;
}

function resolveParser(options, parsers = getParsers(options)) {
  if (Object.prototype.hasOwnProperty.call(parsers, options.parser)) {
    return parsers[options.parser];
  }

  /* istanbul ignore next */
  if (process.env.PRETTIER_TARGET === "universal") {
    throw new ConfigError(
      `Couldn't resolve parser "${options.parser}". Parsers must be explicitly added to the standalone bundle.`
    );
  }
}

async function parse(originalText, opts) {
  const parsers = getParsers(opts);

  // Create a new object {parserName: parseFn}. Uses defineProperty() to only call
  // the parsers getters when actually calling the parser `parse` function.
  const parsersForCustomParserApi = Object.defineProperties(
    {},
    Object.fromEntries(
      Object.keys(parsers).map((parserName) => [
        parserName,
        {
          enumerable: true,
          get() {
            return parsers[parserName].parse;
          },
        },
      ])
    )
  );

  const parser = resolveParser(opts, parsers);
  const text = parser.preprocess
    ? parser.preprocess(originalText, opts)
    : originalText;

  let ast;
  try {
    ast = await parser.parse(text, parsersForCustomParserApi, opts);
  } catch (error) {
    handleParseError(error, originalText);
  }

  return { text, ast };
}

function handleParseError(error, text) {
  const { loc } = error;

  if (loc) {
    const { codeFrameColumns } = require("@babel/code-frame");
    error.codeFrame = codeFrameColumns(text, loc, { highlightCode: true });
    error.message += "\n" + error.codeFrame;
    throw error;
  }

  /* istanbul ignore next */
  throw error;
}

export { parse, resolveParser };
