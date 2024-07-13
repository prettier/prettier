import camelCase from "camelcase";
import { pick } from "../utils.js";
import createMinimistOptions from "./create-minimist-options.js";
import { getContextOptionsWithoutPlugins } from "./get-context-options.js";
import minimist from "./minimist.js";
import normalizeCliOptions from "./normalize-cli-options.js";

function parseArgv(rawArguments, detailedOptions, logger, keys) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  let argv = minimist(rawArguments, minimistOptions);

  if (keys) {
    detailedOptions = detailedOptions.filter((option) =>
      keys.includes(option.name),
    );
    argv = pick(argv, keys);
  }

  const normalized = normalizeCliOptions(argv, detailedOptions, { logger });

  return {
    ...Object.fromEntries(
      Object.entries(normalized).map(([key, value]) => {
        const option = detailedOptions.find(({ name }) => name === key) || {};
        // If the flag is a prettier api option, use the option name
        // Otherwise use camel case for readability
        // `--ignore-unknown` -> `ignoreUnknown`
        return [option.forwardToApi || camelCase(key), value];
      }),
    ),
    _: normalized._?.map(String),
    get __raw() {
      return argv;
    },
  };
}

const { detailedOptions: detailedOptionsWithoutPlugins } =
  getContextOptionsWithoutPlugins();
function parseArgvWithoutPlugins(rawArguments, logger, keys) {
  return parseArgv(
    rawArguments,
    detailedOptionsWithoutPlugins,
    logger,
    typeof keys === "string" ? [keys] : keys,
  );
}

export { parseArgv, parseArgvWithoutPlugins };
