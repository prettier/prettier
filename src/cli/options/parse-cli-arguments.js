import pick from "lodash/pick.js";
import camelCase from "camelcase";
import chalk from "chalk";
import prettierInternal from "../prettier-internal.js";
import getContextOptions from "./get-context-options.js";
import minimist from "./minimist.js";
import createMinimistOptions from "./create-minimist-options.js";

const {
  optionsNormalizer: { normalizeCliOptions },
} = prettierInternal;

function parseArgv(rawArguments, detailedOptions, logger, keys) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  let argv = minimist(rawArguments, minimistOptions);

  if (keys) {
    detailedOptions = detailedOptions.filter((option) =>
      keys.includes(option.name)
    );
    argv = pick(argv, keys);
  }

  const normalized = normalizeCliOptions(argv, detailedOptions, {
    logger,
    colorsModule: chalk,
  });

  return Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => {
      const option = detailedOptions.find(({ name }) => name === key) || {};
      // If the flag is a prettier option, use the option name
      // `--plugin-search-dir` -> `pluginSearchDirs`
      // Otherwise use camel case for readability
      // `--ignore-unknown` -> `ignoreUnknown`
      return [option.forwardToApi || camelCase(key), value];
    })
  );
}

const detailedOptionsWithoutPlugins = getContextOptions().detailedOptions;
function parseArgvWithoutPlugins(rawArguments, logger, keys) {
  return parseArgv(
    rawArguments,
    detailedOptionsWithoutPlugins,
    logger,
    typeof keys === "string" ? [keys] : keys
  );
}

export { parseArgv, parseArgvWithoutPlugins };
