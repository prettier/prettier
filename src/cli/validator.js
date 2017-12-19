"use strict";

const camelCase = require("camelcase");
const logger = require("./logger");

function validateArgv(argv) {
  if (argv["write"] && argv["debug-check"]) {
    logger.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && argv.__filePatterns.length) {
    logger.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }
}

function getOptionName(type, option) {
  return type === "cli" ? `--${option.name}` : camelCase(option.name);
}

function validateIntOption(type, value, option) {
  if (!/^\d+$/.test(value) || (type === "api" && typeof value !== "number")) {
    const optionName = getOptionName(type, option);
    throw new Error(
      `Invalid ${optionName} value.\n` +
        `Expected an integer, but received: ${JSON.stringify(value)}`
    );
  }
}

function validateChoiceOption(type, value, option) {
  if (!option.choices.some(choice => choice.value === value)) {
    const optionName = getOptionName(type, option);
    throw new Error(
      `Invalid option for ${optionName}.\n` +
        `Expected ${getJoinedChoices()}, but received: ${JSON.stringify(value)}`
    );
  }

  function getJoinedChoices() {
    const choices = option.choices
      .filter(choice => !choice.deprecated)
      .map(choice => `"${choice.value}"`);
    const head = choices.slice(0, -2);
    const tail = choices.slice(-2);
    return head.concat(tail.join(" or ")).join(", ");
  }
}

module.exports = {
  validateArgv,
  validateIntOption,
  validateChoiceOption
};
