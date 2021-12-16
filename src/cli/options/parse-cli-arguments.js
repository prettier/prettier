"use strict";
const pick = require("lodash/pick");
const camelCase = require("camelcase");
const {
  optionsNormalizer: { normalizeCliOptions },
} = require("../prettier-internal.js");
const getContextOptions = require("./get-context-options.js");
const minimist = require("./minimist.js");
const createMinimistOptions = require("./create-minimist-options.js");

function parseArgv(rawArguments, detailedOptions, logger, keys) {
  const minimistOptions = createMinimistOptions(detailedOptions);
  let argv = minimist(rawArguments, minimistOptions);

  if (keys) {
    detailedOptions = detailedOptions.filter((option) =>
      keys.includes(option.name)
    );
    argv = pick(argv, keys);
  }

  const normalized = normalizeCliOptions(argv, detailedOptions, { logger });

  return Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => [camelCase(key), value])
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

module.exports = { parseArgv, parseArgvWithoutPlugins };
