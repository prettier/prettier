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
    this.filePatterns = argv._.map(String);
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

  // eslint-disable-next-line getter-return
  get performanceTestFlag() {
    const { debugBenchmark, debugRepeat } = this.argv;
    /* istanbul ignore next */
    if (debugBenchmark) {
      return {
        name: "--debug-benchmark",
        debugBenchmark: true,
      };
    }

    if (debugRepeat > 0) {
      return {
        name: "--debug-repeat",
        debugRepeat,
      };
    }

    const { PRETTIER_PERF_REPEAT } = process.env;
    if (PRETTIER_PERF_REPEAT && /^\d+$/.test(PRETTIER_PERF_REPEAT)) {
      return {
        name: "PRETTIER_PERF_REPEAT (environment variable)",
        debugRepeat: Number(PRETTIER_PERF_REPEAT),
      };
    }
  }
}

module.exports = Context;
