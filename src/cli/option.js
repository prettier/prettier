"use strict";

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");

const { optionsNormalizer } = require("./prettier-internal");
const createMinimistOptions = require("./create-minimist-options");

function getOptionsOrDie(context, filePath) {
  try {
    if (context.argv.config === false) {
      context.logger.debug(
        "'--no-config' option found, skip loading config file."
      );
      return null;
    }

    context.logger.debug(
      context.argv.config
        ? `load config file from '${context.argv.config}'`
        : `resolve config from '${filePath}'`
    );

    const options = prettier.resolveConfig.sync(filePath, {
      editorconfig: context.argv.editorconfig,
      config: context.argv.config,
    });

    context.logger.debug("loaded options `" + JSON.stringify(options) + "`");
    return options;
  } catch (error) {
    context.logger.error(
      `Invalid configuration file \`${filePath}\`: ` + error.message
    );
    process.exit(2);
  }
}

function applyConfigPrecedence(context, options) {
  try {
    switch (context.argv["config-precedence"]) {
      case "cli-override":
        return context.parseArgsToOptions(options);
      case "file-override":
        return { ...context.parseArgsToOptions(), ...options };
      case "prefer-file":
        return options || context.parseArgsToOptions();
    }
  } catch (error) {
    /* istanbul ignore next */
    context.logger.error(error.toString());

    /* istanbul ignore next */
    process.exit(2);
  }
}

function getOptionsForFile(context, filepath) {
  const options = getOptionsOrDie(context, filepath);

  const hasPlugins = options && options.plugins;
  if (hasPlugins) {
    context.pushContextPlugins(options.plugins);
  }

  const appliedOptions = {
    filepath,
    ...applyConfigPrecedence(
      context,
      options &&
        optionsNormalizer.normalizeApiOptions(options, context.supportOptions, {
          logger: context.logger,
        })
    ),
  };

  context.logger.debug(
    `applied config-precedence (${context.argv["config-precedence"]}): ` +
      `${JSON.stringify(appliedOptions)}`
  );

  if (hasPlugins) {
    context.popContextPlugins();
  }

  return appliedOptions;
}

module.exports = {
  getOptionsForFile,
  createMinimistOptions,
};
