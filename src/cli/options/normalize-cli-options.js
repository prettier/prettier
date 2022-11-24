"use strict";

// eslint-disable-next-line no-restricted-modules
const { default: chalk } = require("../../../vendors/chalk.js");
// eslint-disable-next-line no-restricted-modules
const { default: leven } = require("../../../vendors/leven.js");
const { optionsNormalizer } = require("../prettier-internal.js");

function normalizeCliOptions(options, optionInfos, opts) {
  return optionsNormalizer.normalizeCliOptions(options, optionInfos, {
    colorsModule: chalk,
    levenshteinDistance: leven,
    ...opts,
  });
}

module.exports = normalizeCliOptions;
