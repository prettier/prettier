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
  constructor(result) {
    this.stack = [{}];

    const { args, contextOptions, argv, logger } = result;
    this.args = args;

    Object.assign(this, contextOptions);
    this.argv = argv;
    this.logger = logger;

    const { plugin } = argv;
    const pluginSearchDirs = argv["plugin-search-dir"];

    this.pushContextPlugins(plugin, pluginSearchDirs);
    const argv2 = parseArgv(
      this.args,
      this.detailedOptions,
      undefined,
      this.logger
    );

    this.argv = argv2;
    this.filePatterns = argv2._.map((file) => String(file));
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

function init(args) {
  const contextOptions = getContextOptions();
  const argv = parseArgv(args, contextOptions.detailedOptions, [
    "loglevel",
    "plugin",
    "plugin-search-dir",
  ]);

  return { args, contextOptions, argv };
}

module.exports = { init, Context };
