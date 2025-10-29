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
  let {
    experimentalFeatures,
    getVisitorKeys,
    embed: originalEmbed,
    massageAstNode: originalCleanFunction,
    print: originalPrint,
    ...printerRestProperties
  } = typeof printerOrPrinterInitFunction === "function"
    ? await printerOrPrinterInitFunction()
    : printerOrPrinterInitFunction;

  experimentalFeatures = normalizeExperimentalFeatures(experimentalFeatures);
  getVisitorKeys = createGetVisitorKeysFunction(getVisitorKeys);

  let massageAstNode;
  if (originalCleanFunction) {
    if (experimentalFeatures.frontMatterSupport.clean) {
      massageAstNode = (...arguments_) => {
        cleanFrontMatter(...arguments_);
        return originalCleanFunction(...arguments_);
      };
    } else {
      massageAstNode = (...arguments_) => originalCleanFunction(...arguments_);
    }

    massageAstNode.ignoredProperties = originalCleanFunction.ignoredProperties;
  }

  let embed;
  if (originalEmbed) {
    if (experimentalFeatures.frontMatterSupport.embed) {
      embed = (...arguments_) =>
        isEmbedFrontMatter(...arguments_)
          ? printEmbedFrontMatter
          : originalEmbed(...arguments_);
    } else {
      embed = (...arguments_) => originalEmbed(...arguments_);
    }

    embed.getVisitorKeys = originalEmbed.getVisitorKeys
      ? createGetVisitorKeysFunction(originalEmbed.getVisitorKeys)
      : getVisitorKeys;
  }

  let print;
  if (experimentalFeatures.frontMatterSupport.print) {
    print = (...arguments_) =>
      (isFrontMatter(arguments_[0].node) ? printFrontMatter : originalPrint)(
        ...arguments_,
      );
  }

  return {
    experimentalFeatures,
    getVisitorKeys,
    embed,
    massageAstNode,
    print,
    ...printerRestProperties,
  };
}

function normalizeFrontMatterSupport(frontMatterSupport) {
  if (frontMatterSupport === true) {
    return {
      clean: true,
      embed: true,
      print: true,
    };
  }

  return {
    clean: false,
    embed: false,
    print: false,
    ...frontMatterSupport,
  };
}

function normalizeExperimentalFeatures(experimentalFeatures) {
  return {
    avoidAstMutation: false,
    ...experimentalFeatures,
    frontMatterSupport: normalizeFrontMatterSupport(
      experimentalFeatures?.frontMatterSupport,
    ),
  };
}

export {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  initPrinter,
  resolveParser,
};
