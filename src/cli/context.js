"use strict";
const fromPairs = require("lodash/fromPairs");
const pick = require("lodash/pick");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const {
  optionsModule,
  optionsNormalizer: { normalizeCliOptions },
  utils: { arrayify },
} = require("./prettier-internal");
const minimist = require("./minimist");
const constant = require("./constant");
const {
  createDetailedOptionMap,
  normalizeDetailedOptionMap,
} = require("./option-map");
const createMinimistOptions = require("./create-minimist-options");

/**
 * @typedef {Object} Context
 * @property logger
 * @property {string[]} rawArguments
 * @property argv
 * @property {string[]} filePatterns
 * @property {any[]} supportOptions
 * @property detailedOptions
 * @property detailedOptionMap
 * @property apiDefaultOptions
 * @property languages
 * @property {Partial<Context>[]} stack
 * @property pushContextPlugins
 * @property popContextPlugins
 */

class Context {
  constructor({ rawArguments, logger }) {
    this.rawArguments = rawArguments;
    this.logger = logger;
    this.stack = [];

    const {
      plugin: plugins,
      "plugin-search-dir": pluginSearchDirs,
    } = parseArgvWithoutPlugin(
      rawArguments,
      ["plugin", "plugin-search-dir"],
      logger
    );

    this.pushContextPlugins(plugins, pluginSearchDirs);

    const argv = parseArgv(
      rawArguments,
      this.detailedOptions,
      undefined,
      logger
    );
    this.argv = argv;
    this.filePatterns = argv._.map((file) => String(file));
  }

  /**
   * @param {string[]} plugins
   * @param {string[]=} pluginSearchDirs
   */
  pushContextPlugins(plugins, pluginSearchDirs) {
    this.stack.push(
      pick(this, [
        "supportOptions",
        "detailedOptions",
        "detailedOptionMap",
        "apiDefaultOptions",
        "languages",
      ])
    );

    Object.assign(this, getContextOptions(plugins, pluginSearchDirs));
  }

  popContextPlugins() {
    Object.assign(this, this.stack.pop());
  }
}

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
    ...fromPairs(
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

function parseArgv(rawArguments, detailedOptions, keys, logger) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  let argv = minimist(rawArguments, minimistOptions);

  if (keys) {
    detailedOptions = detailedOptions.filter((option) =>
      keys.includes(option.name)
    );
    argv = pick(argv, keys);
  }

  return normalizeCliOptions(argv, detailedOptions, { logger });
}

const contextOptionsWithoutPlugin = getContextOptions();
function parseArgvWithoutPlugin(rawArguments, keys, logger) {
  return parseArgv(
    rawArguments,
    contextOptionsWithoutPlugin.detailedOptions,
    typeof keys === "string" ? [keys] : keys,
    logger
  );
}

module.exports = { Context, parseArgvWithoutPlugin };
