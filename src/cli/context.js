"use strict";
const fromPairs = require("lodash/fromPairs");
const pick = require("lodash/pick");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const { createLogger } = require("./logger");
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
  constructor(args) {
    this.args = args;
    this.stack = [{}];

    const contextOptions = getContextOptions();
    Object.assign(this, contextOptions);
    const argv = parseArgv(args, contextOptions.detailedOptions);
    this.argv = argv;
    this.filePatterns = argv._.map((file) => String(file));
    this._normalizeContextArgv(["loglevel", "plugin", "plugin-search-dir"]);
    this.logger = createLogger(this.argv.loglevel);
    this._updateContextArgv(this.argv.plugin, this.argv["plugin-search-dir"]);
  }

  initContext() {
    // split into 2 step so that we could wrap this in a `try..catch` in cli/index.js
    this._normalizeContextArgv();
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

  _updateContextArgv(plugins, pluginSearchDirs) {
    this.pushContextPlugins(plugins, pluginSearchDirs);
    const argv = parseArgv(this.args, this.detailedOptions);
    this.argv = argv;
    this.filePatterns = argv._.map((file) => String(file));
  }

  _normalizeContextArgv(keys) {
    this.argv = normalizeContextArgv(
      this.detailedOptions,
      this.argv,
      keys,
      this.logger
    );
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

function parseArgv(args, detailedOptions) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  return minimist(args, minimistOptions);
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

module.exports = Context;
