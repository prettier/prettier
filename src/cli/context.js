"use strict";
const fromPairs = require("lodash/fromPairs");
const pick = require("lodash/pick");
const dashify = require("dashify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const minimist = require("./minimist");
const {
  optionsModule,
  optionsNormalizer: { normalizeCliOptions, normalizeApiOptions },
  utils: { arrayify },
} = require("./prettier-internal");
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
    } = parseArgvWithoutPlugins(
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

  parseArgsToOptions(overrideDefaults) {
    const { detailedOptions, rawArguments } = this;
    const apiDetailedOptionMap = fromPairs(
      detailedOptions
        .filter(
          ({ forwardToApi, name }) => forwardToApi && forwardToApi !== name
        )
        .map((option) => [option.forwardToApi, option])
    );
    const cliifyOptions = fromPairs(
      Object.entries(overrideDefaults || {}).map(([key, value]) => {
        const apiOption = apiDetailedOptionMap[key];
        const cliKey = apiOption ? apiOption.name : key;
        return [dashify(cliKey), value];
      })
    );

    const argv = minimist(rawArguments, {
      ...createMinimistOptions(detailedOptions),
      default: cliifyOptions,
    });

    const normalized = normalizeCliOptions(argv, detailedOptions, {
      logger: false,
    });

    return fromPairs(
      detailedOptions
        .filter(({ forwardToApi }) => forwardToApi)
        .map(({ forwardToApi, name }) => [forwardToApi, normalized[name]])
    );
  }

  applyConfigPrecedence(options) {
    switch (this.argv["config-precedence"]) {
      case "cli-override":
        return this.parseArgsToOptions(options);
      case "file-override":
        return { ...this.parseArgsToOptions(), ...options };
      case "prefer-file":
        return options || this.parseArgsToOptions();
    }
  }

  getOptionsForFile(filepath) {
    const { argv, logger } = this;
    const options = this.getOptionsOrDie(filepath);

    const hasPlugins = options && options.plugins;
    if (hasPlugins) {
      this.pushContextPlugins(options.plugins);
    }

    let appliedOptions;
    try {
      appliedOptions = this.applyConfigPrecedence(
        options && normalizeApiOptions(options, this.supportOptions, { logger })
      );
    } catch (error) {
      /* istanbul ignore next */
      logger.error(error.toString());

      /* istanbul ignore next */
      process.exit(2);
    }

    appliedOptions = { filepath, ...appliedOptions };

    logger.debug(
      `applied config-precedence (${argv["config-precedence"]}): ` +
        `${JSON.stringify(appliedOptions)}`
    );

    if (hasPlugins) {
      this.popContextPlugins();
    }

    return appliedOptions;
  }

  getOptionsOrDie(filePath) {
    const { argv, logger } = this;
    try {
      if (argv.config === false) {
        logger.debug("'--no-config' option found, skip loading config file.");
        return;
      }

      logger.debug(
        argv.config
          ? `load config file from '${argv.config}'`
          : `resolve config from '${filePath}'`
      );

      const options = prettier.resolveConfig.sync(filePath, {
        editorconfig: argv.editorconfig,
        config: argv.config,
      });

      logger.debug("loaded options `" + JSON.stringify(options) + "`");
      return options;
    } catch (error) {
      logger.error(
        `Invalid configuration file \`${filePath}\`: ` + error.message
      );
      process.exit(2);
    }
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

const detailedOptionsWithoutPlugins = getContextOptions().detailedOptions;
function parseArgvWithoutPlugins(rawArguments, keys, logger) {
  return parseArgv(
    rawArguments,
    detailedOptionsWithoutPlugins,
    typeof keys === "string" ? [keys] : keys,
    logger
  );
}

module.exports = { Context, parseArgvWithoutPlugins };
