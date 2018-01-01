"use strict";

const path = require("path");
const supportInfo = require("../common/support").getSupportInfo(null, {
  showDeprecated: true,
  showUnreleased: true
});
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
    Object.assign(
      reduced,
      !optionInfo.deprecated && { [optionInfo.name]: optionInfo.default }
    ),
  Object.assign({}, hiddenDefaults)
);

// Copy options and fill in default values.
function normalize(options, opts) {
  opts = opts || {};

  const rawOptions = Object.assign({}, options);

  if (opts.inferParser !== false) {
    if (
      rawOptions.filepath &&
      (!rawOptions.parser || rawOptions.parser === defaults.parser)
    ) {
      const inferredParser = inferParser(rawOptions.filepath);
      if (inferredParser) {
        rawOptions.parser = inferredParser;
      }
    }
  }

  rawOptions.plugins = loadPlugins(rawOptions);
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

function inferParser(filepath) {
  const extension = path.extname(filepath);
  const filename = path.basename(filepath).toLowerCase();

  const language = supportInfo.languages.find(
    language =>
      typeof language.since === "string" &&
      (language.extensions.indexOf(extension) > -1 ||
        (language.filenames &&
          language.filenames.find(name => name.toLowerCase() === filename)))
  );

  return language && language.parsers[0];
}

module.exports = { normalize, defaults, hiddenDefaults };
