import path from "node:path";
import { getContextOptions } from "./options/get-context-options.js";
import {
  parseArgv,
  parseArgvWithoutPlugins,
} from "./options/parse-cli-arguments.js";
import getOptionsOrDie from "./options/get-options-or-die.js";
import { createIsIgnoredFromContextOrDie } from "./ignore.js";

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

    const {
      plugins,
      ignorePath,
      withNodeModules,
      config,
      editorconfig,
      _: filePatterns,
    } = parseArgvWithoutPlugins(rawArguments, logger, [
      "plugin",
      "ignore-path",
      "with-node-modules",
      // "config",
      "editorconfig",
      "_",
    ]);

    const pluginsFromConfigFile = await this.#loadPluginsFromConfigFile(
      filePatterns,
      config,
      editorconfig,
      ignorePath,
      withNodeModules,
    );

    await this.pushContextPlugins([...plugins, ...pluginsFromConfigFile]);

    const argv = parseArgv(rawArguments, this.detailedOptions, logger);
    this.argv = argv;
    this.filePatterns = argv._;
  }

  async #loadPluginsFromConfigFile(
    filePatterns,
    config,
    editorconfig,
    ignorePath,
    withNodeModules,
  ) {
    const isIgnored = await createIsIgnoredFromContextOrDie({
      logger: this.logger,
      argv: { ignorePath, withNodeModules },
    });
    const plugins = [];
    const cwd = process.cwd();
    for (const filePattern of filePatterns) {
      const absolutePath = path.resolve(cwd, filePattern);
      if (isIgnored(absolutePath)) {
        continue;
      }
      const options = await getOptionsOrDie(
        { logger: this.logger, argv: { config, editorconfig } },
        absolutePath,
      );
      if (Array.isArray(options?.plugins)) {
        for (const plugin of options.plugins) {
          plugins.push(plugin);
        }
      }
    }
    return plugins;
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
    if (PRETTIER_PERF_REPEAT && /^\d+$/.test(PRETTIER_PERF_REPEAT)) {
      return {
        name: "PRETTIER_PERF_REPEAT (environment variable)",
        debugRepeat: Number(PRETTIER_PERF_REPEAT),
      };
    }
    /* c8 ignore stop */
  }
}

export default Context;
