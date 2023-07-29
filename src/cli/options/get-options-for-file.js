import dashify from "dashify";
import { normalizeOptions as normalizeApiOptions } from "../prettier-internal.js";
import minimist from "./minimist.js";
import createMinimistOptions from "./create-minimist-options.js";
import normalizeCliOptions from "./normalize-cli-options.js";
import getOptionsOrDie from "./get-options-or-die.js";

function getOptions(argv, detailedOptions) {
  return Object.fromEntries(
    detailedOptions
      .filter(({ forwardToApi }) => forwardToApi)
      .map(({ forwardToApi, name }) => [forwardToApi, argv[name]]),
  );
}

function cliifyOptions(object, apiDetailedOptionMap) {
  return Object.fromEntries(
    Object.entries(object || {}).map(([key, value]) => {
      const apiOption = apiDetailedOptionMap[key];
      const cliKey = apiOption ? apiOption.name : key;

      return [dashify(cliKey), value];
    }),
  );
}

function createApiDetailedOptionMap(detailedOptions) {
  return Object.fromEntries(
    detailedOptions
      .filter(
        (option) => option.forwardToApi && option.forwardToApi !== option.name,
      )
      .map((option) => [option.forwardToApi, option]),
  );
}

function parseArgsToOptions(context, overrideDefaults) {
  const minimistOptions = createMinimistOptions(context.detailedOptions);
  const apiDetailedOptionMap = createApiDetailedOptionMap(
    context.detailedOptions,
  );
  return getOptions(
    normalizeCliOptions(
      minimist(context.rawArguments, {
        string: minimistOptions.string,
        boolean: minimistOptions.boolean,
        default: cliifyOptions(overrideDefaults, apiDetailedOptionMap),
      }),
      context.detailedOptions,
      { logger: false },
    ),
    context.detailedOptions,
  );
}

function applyConfigPrecedence(context, options) {
  try {
    switch (context.argv.configPrecedence) {
      case "cli-override":
        return parseArgsToOptions(context, options);
      case "file-override":
        return { ...parseArgsToOptions(context), ...options };
      case "prefer-file":
        return options || parseArgsToOptions(context);
    }
  } catch (error) {
    /* c8 ignore start */
    context.logger.error(error.toString());
    process.exit(2);
    /* c8 ignore stop */
  }
}

async function getOptionsForFile(context, filepath) {
  const options = await getOptionsOrDie(context, filepath);

  const hasPlugins = options?.plugins;
  if (hasPlugins) {
    await context.pushContextPlugins(options.plugins);
  }

  const appliedOptions = {
    filepath,
    ...applyConfigPrecedence(
      context,
      options &&
        normalizeApiOptions(options, context.supportOptions, {
          logger: context.logger,
        }),
    ),
  };

  context.logger.debug(
    `applied config-precedence (${context.argv.configPrecedence}): ` +
      `${JSON.stringify(appliedOptions)}`,
  );

  if (hasPlugins) {
    context.popContextPlugins();
  }

  return appliedOptions;
}

export default getOptionsForFile;
