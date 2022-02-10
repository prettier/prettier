import prettierInternal from "./prettier-internal.js";
import getContextOptions from "./options/get-context-options.js";
import {
  parseArgv,
  parseArgvWithoutPlugins,
} from "./options/parse-cli-arguments.js";

const {
  utils: { getLast },
} = prettierInternal;

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

export default Context;
