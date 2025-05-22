import { getContextOptions } from "./options/get-context-options.js";
import {
  parseArgv,
  parseArgvWithoutPlugins,
} from "./options/parse-cli-arguments.js";

/**
 * @typedef {Object} Context
 * @property logger
 * @property {string[]} rawArguments
 * @property argv
 * @property {string[]} filePatterns
 * @property {any[]} supportOptions
 * @property detailedOptions
 * @property languages
 * @property {Partial<Context>[]} stack
 * @property pushContextPlugins
 * @property popContextPlugins
 */

class Context {
  #stack = [];

  constructor({ rawArguments, logger }) {
    this.rawArguments = rawArguments;
    this.logger = logger;
  }

  async init() {
    const { rawArguments, logger } = this;

    const { plugins } = parseArgvWithoutPlugins(rawArguments, logger, [
      "plugin",
    ]);

    await this.pushContextPlugins(plugins);

    const argv = parseArgv(rawArguments, this.detailedOptions, logger);
    this.argv = argv;
    this.filePatterns = argv._;
  }

  /**
   * @param {string[]} plugins
   */
  async pushContextPlugins(plugins) {
    const options = await getContextOptions(plugins);
    this.#stack.push(options);
    Object.assign(this, options);
  }

  popContextPlugins() {
    this.#stack.pop();
    Object.assign(this, this.#stack.at(-1));
  }

  // eslint-disable-next-line getter-return
  get performanceTestFlag() {
    const { debugBenchmark, debugRepeat } = this.argv;
    /* c8 ignore start */
    if (debugBenchmark) {
      return {
        name: "--debug-benchmark",
        debugBenchmark: true,
      };
    }
    /* c8 ignore stop */

    if (debugRepeat > 0) {
      return {
        name: "--debug-repeat",
        debugRepeat,
      };
    }

    /* c8 ignore start */
    const { PRETTIER_PERF_REPEAT } = process.env;
    if (PRETTIER_PERF_REPEAT && /^\d+$/u.test(PRETTIER_PERF_REPEAT)) {
      return {
        name: "PRETTIER_PERF_REPEAT (environment variable)",
        debugRepeat: Number(PRETTIER_PERF_REPEAT),
      };
    }
    /* c8 ignore stop */
  }
}

export default Context;
