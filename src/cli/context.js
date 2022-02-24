"use strict";
const {
  utils: { getLast },
} = require("./prettier-internal.js");
const getContextOptions = require("./options/get-context-options.js");
const {
  parseArgv,
  parseArgvWithoutPlugins,
} = require("./options/parse-cli-arguments.js");

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

    const { plugins, pluginSearchDirs } = parseArgvWithoutPlugins(
      rawArguments,
      logger,
      ["plugin", "plugin-search-dir"]
    );

    this.pushContextPlugins(plugins, pluginSearchDirs);

    const argv = parseArgv(rawArguments, this.detailedOptions, logger);
    this.argv = argv;
    this.filePatterns = argv._.map((file) => String(file));
  }

  /**
   * @param {string[]} plugins
   * @param {string[]=} pluginSearchDirs
   */
  pushContextPlugins(plugins, pluginSearchDirs) {
    const options = getContextOptions(plugins, pluginSearchDirs);
    this.stack.push(options);
    Object.assign(this, options);
  }

  popContextPlugins() {
    this.stack.pop();
    Object.assign(this, getLast(this.stack));
  }
}

module.exports = Context;
