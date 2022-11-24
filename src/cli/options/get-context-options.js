"use strict";
// eslint-disable-next-line no-restricted-modules
const prettier = require("../../index.js");
const {
  optionsModule,
  utils: { arrayify },
} = require("../prettier-internal.js");
const constant = require("../constant.js");
const {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
} = require("./option-map.js");

function getContextOptions(plugins, pluginSearchDirs) {
  const { options: supportOptions, languages } = prettier.getSupportInfo({
    showDeprecated: true,
    showUnreleased: true,
    showInternal: true,
    plugins,
    pluginSearchDirs,
  });
  const detailedOptionMap = normalizeDetailedOptionMap({
    ...createDetailedOptionMap(supportOptions),
    ...constant.options,
  });

  const detailedOptions = arrayify(detailedOptionMap, "name");

  const apiDefaultOptions = {
    ...optionsModule.hiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter(({ deprecated }) => !deprecated)
        .map((option) => [option.name, option.default])
    ),
  };

  return {
    supportOptions,
    detailedOptions,
    detailedOptionMap,
    apiDefaultOptions,
    languages,
  };
}

module.exports = getContextOptions;
