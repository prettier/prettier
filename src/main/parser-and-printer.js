import { ConfigError } from "../common/errors.js";

function getParserPluginByParserName(plugins, parserName) {
  if (!parserName) {
    throw new Error("parserName is required.");
  }

  /*
  Loop from end to allow plugins override builtin plugins,
  this is how `resolveParser` works in v2.
  This is a temporarily solution, see #13729
  */
  const plugin = plugins.findLast(
    (plugin) => plugin.parsers && Object.hasOwn(plugin.parsers, parserName),
  );
  if (plugin) {
    return plugin;
  }

  let message = `Couldn't resolve parser "${parserName}".`;
  if (process.env.PRETTIER_TARGET === "universal") {
    message += " Plugins must be explicitly added to the standalone bundle.";
  }

  throw new ConfigError(message);
}

function getPrinterPluginByAstFormat(plugins, astFormat) {
  if (!astFormat) {
    throw new Error("astFormat is required.");
  }

  // Loop from end to consistent with parser resolve logic
  const plugin = plugins.findLast(
    (plugin) => plugin.printers && Object.hasOwn(plugin.printers, astFormat),
  );
  if (plugin) {
    return plugin;
  }

  let message = `Couldn't find plugin for AST format "${astFormat}".`;
  if (process.env.PRETTIER_TARGET === "universal") {
    message += " Plugins must be explicitly added to the standalone bundle.";
  }

  throw new ConfigError(message);
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

function initPrinter(plugin, astFormat) {
  const printerOrPrinterInitFunction = plugin.printers[astFormat];
  return typeof printerOrPrinterInitFunction === "function"
    ? printerOrPrinterInitFunction()
    : printerOrPrinterInitFunction;
}

export {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  initPrinter,
  resolveParser,
};
