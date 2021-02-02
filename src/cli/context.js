"use strict";
const fromPairs = require("lodash/fromPairs");
const pick = require("lodash/pick");
const dashify = require("dashify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const minimist = require("./minimist");
const {
  optionsModule,
  optionsNormalizer: { normalizeCliOptions },
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
    const minimistOptions = createMinimistOptions(detailedOptions);
    const apiDetailedOptionMap = fromPairs(
      detailedOptions
        .filter(
          (option) => option.forwardToApi && option.forwardToApi !== option.name
        )
        .map((option) => [option.forwardToApi, option])
    );
    return getOptions(
      normalizeCliOptions(
        minimist(rawArguments, {
          string: minimistOptions.string,
          boolean: minimistOptions.boolean,
          default: cliifyOptions(overrideDefaults, apiDetailedOptionMap),
        }),
        detailedOptions,
        { logger: false }
      ),
      detailedOptions
    );
  }
}

function cliifyOptions(object, apiDetailedOptionMap) {
  return fromPairs(
    Object.entries(object || {}).map(([key, value]) => {
      const apiOption = apiDetailedOptionMap[key];
      const cliKey = apiOption ? apiOption.name : key;

      return [dashify(cliKey), value];
    })
  );
}

function getOptions(argv, detailedOptions) {
  return fromPairs(
    detailedOptions
      .filter(({ forwardToApi }) => forwardToApi)
      .map(({ forwardToApi, name }) => [forwardToApi, argv[name]])
  );
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
