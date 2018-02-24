"use strict";

const path = require("path");
const getSupportInfo = require("../common/support").getSupportInfo;
const normalizer = require("./options-normalizer");
const loadPlugins = require("../common/load-plugins");
const resolveParser = require("./parser").resolveParser;
const getPrinter = require("./get-printer");

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
    showUnreleased: true
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

  const parser = resolveParser(rawOptions);
  rawOptions.astFormat = parser.astFormat;
  rawOptions.locEnd = parser.locEnd;
  rawOptions.locStart = parser.locStart;
  rawOptions.printer = getPrinter(rawOptions);

  Object.keys(defaults).forEach(k => {
    if (rawOptions[k] == null) {
      rawOptions[k] = defaults[k];
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
