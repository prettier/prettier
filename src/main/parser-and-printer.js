import { codeFrameColumns } from "@babel/code-frame";
import { ConfigError } from "../common/errors.js";

function getParserPluginByParserName(plugins, parserName) {
  /*
  Loop from end to allow plugins override builtin plugins,
  this is how `resolveParser` works in v2.
  This is a temporarily solution, see #13729
  */
  for (let index = plugins.length - 1; index >= 0; index--) {
    const plugin = plugins[index];
    if (plugin.parsers && Object.hasOwn(plugin.parsers, parserName)) {
      return plugin;
    }
  }

  /* c8 ignore start */
  let message = `Couldn't resolve parser "${parserName}".`;
  if (process.env.PRETTIER_TARGET === "universal") {
    message += " Plugins must be explicitly added to the standalone bundle.";
  }

  throw new ConfigError(message);
  /* c8 ignore stop */
}

function getPrinterPluginByAstFormat(plugins, astFormat) {
  // TODO: test this with plugins
  /* c8 ignore start */
  if (!astFormat) {
    throw new Error("astFormat is required.");
  }
  /* c8 ignore stop */
  // TODO: test this with plugins

  // Loop from end to consistent with parser resolve logic
  for (let index = plugins.length - 1; index >= 0; index--) {
    const plugin = plugins[index];
    if (plugin.printers && Object.hasOwn(plugin.printers, astFormat)) {
      return plugin;
    }
  }

  /* c8 ignore start */
  let message = `Couldn't find plugin for AST format "${astFormat}".`;
  if (process.env.PRETTIER_TARGET === "universal") {
    message += " Plugins must be explicitly added to the standalone bundle.";
  }

  throw new ConfigError(message);
  /* c8 ignore stop */
}

function resolveParser({ plugins, parser }) {
  const plugin = getParserPluginByParserName(plugins, parser);
  return initParser(plugin, parser);
}

function initParser(plugin, parserName) {
  const parserOrParserInitFunction = plugin.parsers[parserName];
  return typeof parserOrParserInitFunction === "function"
    ? parserOrParserInitFunction()
    : parserOrParserInitFunction;
}

async function parse(originalText, options) {
  const parser = await resolveParser(options);
  const text = parser.preprocess
    ? parser.preprocess(originalText, options)
    : originalText;
  options.originalText = text;

  let ast;
  try {
    ast = await parser.parse(
      text,
      options,
      // TODO: remove the third argument in v4
      // The duplicated argument is passed as intended, see #10156
      options
    );
  } catch (error) {
    handleParseError(error, originalText);
  }

  return { text, ast };
}

function handleParseError(error, text) {
  const { loc } = error;

  if (loc) {
    const codeFrame = codeFrameColumns(text, loc, { highlightCode: true });
    error.message += "\n" + codeFrame;
    error.codeFrame = codeFrame;
    throw error;
  }

  /* c8 ignore next */
  throw error;
}

export {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  parse,
  resolveParser,
};
