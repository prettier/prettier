"use strict";
const fromPairs = require("lodash/fromPairs");
const pick = require("lodash/pick");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const {
  optionsModule,
  optionsNormalizer,
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
 * @property {string[]} args
 * @property argv
 * @property {string[]} filePatterns
 * @property {any[]} supportOptions
 * @property detailedOptions
 * @property detailedOptionMap
 * @property apiDefaultOptions
 * @property languages
 * @property {Partial<Context>[]} stack
 * @property initContext
 * @property pushContextPlugins
 * @property popContextPlugins
 */

class Context {
  constructor({ rawArguments, plugins, pluginSearchDirs, logger }) {
    this.args = rawArguments;
    this.logger = logger;
    this.stack = [{}];

    Object.assign(this, getContextOptions());
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
    this._updateContextOptions(plugins, pluginSearchDirs);
  }

  popContextPlugins() {
    Object.assign(this, this.stack.pop());
  }

  /**
   * @param {string[]} plugins
   * @param {string[]=} pluginSearchDirs
   */
  _updateContextOptions(plugins, pluginSearchDirs) {
    Object.assign(this, getContextOptions(plugins, pluginSearchDirs));
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

function parseArgv(args, detailedOptions, keys, logger) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  const parsed = minimist(args, minimistOptions);
  const normalized = normalizeContextArgv(
    detailedOptions,
    parsed,
    keys,
    logger
  );
  return normalized;
}

function normalizeContextArgv(detailedOptions, argv, keys, logger) {
  if (keys) {
    detailedOptions = detailedOptions.filter((option) =>
      keys.includes(option.name)
    );
    argv = pick(argv, keys);
  }

  return optionsNormalizer.normalizeCliOptions(argv, detailedOptions, {
    logger,
  });
}

function init(rawArguments) {
  const { detailedOptions } = getContextOptions();
  const argv = parseArgv(rawArguments, detailedOptions, [
    "loglevel",
    "plugin",
    "plugin-search-dir",
  ]);
  return argv;
}

module.exports = { init, Context };
