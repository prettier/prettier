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
    this.stack = [];
    this._updateContextArgv();
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
    const minimistOptions = createMinimistOptions(this.detailedOptions);
    const argv = minimist(this.args, minimistOptions);
    this.argv = argv;
    this.filePatterns = argv._.map((file) => String(file));
  }

  _normalizeContextArgv(keys) {
    const detailedOptions = !keys
      ? this.detailedOptions
      : this.detailedOptions.filter((option) => keys.includes(option.name));
    const argv = !keys ? this.argv : pick(this.argv, keys);
    this.argv = optionsNormalizer.normalizeCliOptions(argv, detailedOptions, {
      logger: this.logger,
    });
  }

  /**
   * @param {string[]} plugins
   * @param {string[]=} pluginSearchDirs
   */
  _updateContextOptions(plugins, pluginSearchDirs) {
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

    Object.assign(this, {
      supportOptions,
      detailedOptions,
      detailedOptionMap,
      apiDefaultOptions,
      languages,
    });
  }
}

module.exports = Context;
