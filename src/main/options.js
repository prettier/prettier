"use strict";

const normalizePath = require("normalize-path");
const UndefinedParserError = require("../common/errors").UndefinedParserError;
const getSupportInfo = require("../main/support").getSupportInfo;
const normalizer = require("./options-normalizer");
const resolveParser = require("./parser").resolveParser;

const hiddenDefaults = {
  astFormat: "estree",
  printer: {},
  originalText: undefined,
  locStart: null,
  locEnd: null
};

// Copy options and fill in default values.
function normalize(options, opts) {
  opts = opts || {};

  const rawOptions = Object.assign({}, options);

  const supportOptions = getSupportInfo(null, {
    plugins: options.plugins,
    showUnreleased: true,
    showDeprecated: true
  }).options;
  const defaults = supportOptions.reduce(
    (reduced, optionInfo) =>
      optionInfo.default !== undefined
        ? Object.assign(reduced, { [optionInfo.name]: optionInfo.default })
        : reduced,
    Object.assign({}, hiddenDefaults)
  );

  if (!rawOptions.parser) {
    if (!rawOptions.filepath) {
      const logger = opts.logger || console;
      logger.warn(
        "No parser and no filepath given, using 'babylon' the parser now " +
          "but this will throw an error in the future. " +
          "Please specify a parser or a filepath so one can be inferred."
      );
      rawOptions.parser = "babylon";
    } else {
      rawOptions.parser = inferParser(rawOptions.filepath, rawOptions.plugins);
      if (!rawOptions.parser) {
        throw new UndefinedParserError(
          `No parser could be inferred for file: ${rawOptions.filepath}`
        );
      }
    }
  }

  const parser = resolveParser(
    normalizer.normalizeApiOptions(
      rawOptions,
      [supportOptions.find(x => x.name === "parser")],
      { passThrough: true, logger: false }
    )
  );
  rawOptions.astFormat = parser.astFormat;
  rawOptions.locEnd = parser.locEnd;
  rawOptions.locStart = parser.locStart;

  const plugin = getPlugin(rawOptions);
  rawOptions.printer = plugin.printers[rawOptions.astFormat];

  const pluginDefaults = supportOptions
    .filter(
      optionInfo =>
        optionInfo.pluginDefaults && optionInfo.pluginDefaults[plugin.name]
    )
    .reduce(
      (reduced, optionInfo) =>
        Object.assign(reduced, {
          [optionInfo.name]: optionInfo.pluginDefaults[plugin.name]
        }),
      {}
    );

  const mixedDefaults = Object.assign({}, defaults, pluginDefaults);

  Object.keys(mixedDefaults).forEach(k => {
    if (rawOptions[k] == null) {
      rawOptions[k] = mixedDefaults[k];
    }
  });

  if (rawOptions.parser === "json") {
    rawOptions.trailingComma = "none";
  }

  return normalizer.normalizeApiOptions(
    rawOptions,
    supportOptions,
    Object.assign({ passThrough: Object.keys(hiddenDefaults) }, opts)
  );
}

function getPlugin(options) {
  const { astFormat } = options;

  if (!astFormat) {
    throw new Error("getPlugin() requires astFormat to be set");
  }
  const printerPlugin = options.plugins.find(
    plugin => plugin.printers && plugin.printers[astFormat]
  );
  if (!printerPlugin) {
    throw new Error(`Couldn't find plugin for AST format "${astFormat}"`);
  }

  return printerPlugin;
}

function inferParser(filepath, plugins) {
  const filepathParts = normalizePath(filepath).split("/");
  const filename = filepathParts[filepathParts.length - 1].toLowerCase();

  const language = getSupportInfo(null, {
    plugins
  }).languages.find(
    language =>
      language.since !== null &&
      ((language.extensions &&
        language.extensions.some(extension => filename.endsWith(extension))) ||
        (language.filenames &&
          language.filenames.find(name => name.toLowerCase() === filename)))
  );

  return language && language.parsers[0];
}

module.exports = { normalize, hiddenDefaults, inferParser };
