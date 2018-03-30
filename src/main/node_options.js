"use strict";

const path = require("path");
const getSupportInfo = require("../common/support").getSupportInfo;
const normalizer = require("./options-normalizer");
const loadPlugins = require("../common/load-plugins");
const resolveParser = require("./parser").resolveParser;
const getPlugin = require("./get-plugin");

const hiddenDefaults = {
  astFormat: "estree",
  printer: {},
  locStart: null,
  locEnd: null
};

// Copy options and fill in default values.
function normalize(options, opts) {
  opts = opts || {};

  const rawOptions = Object.assign({}, options);

  const plugins = loadPlugins(rawOptions.plugins);
  rawOptions.plugins = plugins;

  const supportOptions = getSupportInfo(null, {
    plugins,
    pluginsLoaded: true,
    showUnreleased: true,
    showDeprecated: true
  }).options;
  const defaults = supportOptions.reduce(
    (reduced, optionInfo) =>
      Object.assign(reduced, { [optionInfo.name]: optionInfo.default }),
    Object.assign({}, hiddenDefaults)
  );

  if (opts.inferParser !== false) {
    if (
      rawOptions.filepath &&
      (!rawOptions.parser || rawOptions.parser === defaults.parser)
    ) {
      const inferredParser = inferParser(
        rawOptions.filepath,
        rawOptions.plugins
      );
      if (inferredParser) {
        rawOptions.parser = inferredParser;
      }
    }
  }

  const parser = resolveParser(
    !rawOptions.parser
      ? rawOptions
      : // handle deprecated parsers
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

function inferParser(filepath, plugins) {
  const extension = path.extname(filepath);
  const filename = path.basename(filepath).toLowerCase();

  const language = getSupportInfo(null, {
    plugins,
    pluginsLoaded: true
  }).languages.find(
    language =>
      language.since !== null &&
      (language.extensions.indexOf(extension) > -1 ||
        (language.filenames &&
          language.filenames.find(name => name.toLowerCase() === filename)))
  );

  return language && language.parsers[0];
}

module.exports = { normalize, hiddenDefaults };
