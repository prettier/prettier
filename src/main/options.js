"use strict";

const path = require("path");
const getSupportInfo = require("../common/support").getSupportInfo;
const supportInfo = getSupportInfo(null, { showUnreleased: true });
const normalizer = require("./options-normalizer");
const loadPlugins = require("../common/load-plugins");
const resolveParser = require("./parser").resolveParser;
const getPrinter = require("./get-printer");

const hiddenDefaults = {
  astFormat: "estree",
  printer: {}
};

const defaults = supportInfo.options.reduce(
  (reduced, optionInfo) =>
    Object.assign(reduced, { [optionInfo.name]: optionInfo.default }),
  Object.assign({}, hiddenDefaults)
);

// Copy options and fill in default values.
function normalize(options, opts) {
  opts = opts || {};

  const rawOptions = Object.assign({}, options);
  rawOptions.plugins = loadPlugins(rawOptions.plugins);

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

  rawOptions.astFormat = resolveParser(rawOptions).astFormat;
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
    supportInfo.options,
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
      typeof language.since === "string" &&
      (language.extensions.indexOf(extension) > -1 ||
        (language.filenames &&
          language.filenames.find(name => name.toLowerCase() === filename)))
  );

  return language && language.parsers[0];
}

module.exports = { normalize, defaults, hiddenDefaults };
