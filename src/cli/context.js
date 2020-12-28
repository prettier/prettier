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

class Context {
  constructor(args) {
    this.args = args;
    this.stack = [];
    updateContextArgv(this);
    normalizeContextArgv(this, ["loglevel", "plugin", "plugin-search-dir"]);
    this.logger = createLogger(this.argv.loglevel);
    updateContextArgv(this, this.argv.plugin, this.argv["plugin-search-dir"]);
  }
}

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
 */

function initContext(context) {
  // split into 2 step so that we could wrap this in a `try..catch` in cli/index.js
  normalizeContextArgv(context);
}

/**
 * @param {Context} context
 * @param {string[]} plugins
 * @param {string[]=} pluginSearchDirs
 */
function updateContextOptions(context, plugins, pluginSearchDirs) {
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

  Object.assign(context, {
    supportOptions,
    detailedOptions,
    detailedOptionMap,
    apiDefaultOptions,
    languages,
  });
}

/**
 * @param {Context} context
 * @param {string[]} plugins
 * @param {string[]=} pluginSearchDirs
 */
function pushContextPlugins(context, plugins, pluginSearchDirs) {
  context.stack.push(
    pick(context, [
      "supportOptions",
      "detailedOptions",
      "detailedOptionMap",
      "apiDefaultOptions",
      "languages",
    ])
  );
  updateContextOptions(context, plugins, pluginSearchDirs);
}

/**
 * @param {Context} context
 */
function popContextPlugins(context) {
  Object.assign(context, context.stack.pop());
}

function updateContextArgv(context, plugins, pluginSearchDirs) {
  pushContextPlugins(context, plugins, pluginSearchDirs);

  const minimistOptions = createMinimistOptions(context.detailedOptions);
  const argv = minimist(context.args, minimistOptions);

  context.argv = argv;
  context.filePatterns = argv._.map((file) => String(file));
}

function normalizeContextArgv(context, keys) {
  const detailedOptions = !keys
    ? context.detailedOptions
    : context.detailedOptions.filter((option) => keys.includes(option.name));
  const argv = !keys ? context.argv : pick(context.argv, keys);

  context.argv = optionsNormalizer.normalizeCliOptions(argv, detailedOptions, {
    logger: context.logger,
  });
}

module.exports = {
  Context,
  initContext,
  popContextPlugins,
  pushContextPlugins,
};
