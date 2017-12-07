"use strict";

const path = require("path");
const supportInfo = require("./support").getSupportInfo();
const normalizer = require("./options-normalizer");

const defaults = supportInfo.options.reduce(
  (reduced, optionInfo) =>
    Object.assign(reduced, { [optionInfo.name]: optionInfo.default }),
  {}
);

// Copy options and fill in default values.
function normalize(options) {
  const rawOptions = Object.assign({}, options);

  if (
    rawOptions.filepath &&
    (!rawOptions.parser || rawOptions.parser === defaults.parser)
  ) {
    const inferredParser = inferParser(rawOptions.filepath);
    if (inferredParser) {
      rawOptions.parser = inferredParser;
    }
  }

  Object.keys(defaults).forEach(k => {
    if (rawOptions[k] == null) {
      rawOptions[k] = defaults[k];
    }
  });

  if (rawOptions.parser === "json") {
    rawOptions.trailingComma = "none";
  }

  return normalizer.normalizeOptions(rawOptions, supportInfo.options, {
    exception: {
      parser: value => typeof value === "string" || typeof value === "function"
    }
  });
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

module.exports = { normalize, defaults };
