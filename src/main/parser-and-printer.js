import * as assert from "#universal/assert";
import { ConfigError } from "../common/errors.js";
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";
import {
  cleanFrontMatter,
  isEmbedFrontMatter,
  isFrontMatter,
  printEmbedFrontMatter,
  printFrontMatter,
} from "./front-matter/index.js";

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

async function initPrinter(plugin, astFormat) {
  const printerOrPrinterInitFunction = plugin.printers[astFormat];
  const printer =
    typeof printerOrPrinterInitFunction === "function"
      ? await printerOrPrinterInitFunction()
      : printerOrPrinterInitFunction;
  return normalizePrinter(printer);
}

const normalizedPrinters = new WeakMap();
const PRINTER_NORMALIZED_MARK = Symbol("PRINTER_NORMALIZED_MARK");
function normalizePrinter(printer) {
  if (normalizedPrinters.has(printer)) {
    return normalizedPrinters.get(printer);
  }

  /* c8 ignore next 6 */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(
      !printer[PRINTER_NORMALIZED_MARK],
      "Unexpected printer normalization",
    );
  }

  let {
    features,
    getVisitorKeys,
    embed: originalEmbed,
    massageAstNode: originalCleanFunction,
    print: originalPrint,
    ...printerRestProperties
  } = printer;

  features = normalizePrinterFeatures(features);
  getVisitorKeys = createGetVisitorKeysFunction(getVisitorKeys);

  const frontMatterSupport = features.experimental_frontMatterSupport;
  let massageAstNode = originalCleanFunction;
  if (originalCleanFunction && frontMatterSupport.massageAstNode) {
    massageAstNode = new Proxy(originalCleanFunction, {
      apply(target, thisArg, argumentsList) {
        cleanFrontMatter(...argumentsList);
        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  let embed = originalEmbed;
  if (originalEmbed && frontMatterSupport.embed) {
    embed = new Proxy(originalEmbed, {
      apply: (target, thisArg, argumentsList) =>
        isEmbedFrontMatter(...argumentsList)
          ? printEmbedFrontMatter
          : Reflect.apply(target, thisArg, argumentsList),
    });
  }

  let print = originalPrint;
  if (features.frontMatterSupport.print) {
    print = (...arguments_) =>
      (isFrontMatter(arguments_[0].node) ? printFrontMatter : originalPrint)(
        ...arguments_,
      );
  }

  const normalizedPrinter = {
    features,
    getVisitorKeys,
    embed,
    massageAstNode,
    print,
    ...printerRestProperties,
  };

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    normalizedPrinter[PRINTER_NORMALIZED_MARK] = true;
  }

  normalizedPrinters.set(printer, normalizedPrinter);
  return normalizedPrinter;
}

const PRINTER_FRONT_MATTER_SUPPORT_FEATURES = ["clean", "embed", "print"];
const PRINTER_FRONT_MATTER_SUPPORT_OFF = Object.fromEntries(
  PRINTER_FRONT_MATTER_SUPPORT_FEATURES.map((feature) => [feature, false]),
);
function normalizePrinterFrontMatterSupport(frontMatterSupport) {
  return {
    ...PRINTER_FRONT_MATTER_SUPPORT_OFF,
    ...frontMatterSupport,
  };
}

function normalizePrinterFeatures(features) {
  return {
    experimental_avoidAstMutation: false,
    ...features,
    experimental_frontMatterSupport: normalizePrinterFrontMatterSupport(
      features?.experimental_frontMatterSupport,
    ),
  };
}

export {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  initPrinter,
  normalizePrinter,
  resolveParser,
};
