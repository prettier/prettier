"use strict";

function validateArgv(argv) {
  if (argv["write"] && argv["debug-check"]) {
    console.error("Cannot use --write and --debug-check together.");
    process.exit(1);
  }

  if (argv["find-config-path"] && argv.__filePatterns.length) {
    console.error("Cannot use --find-config-path with multiple files");
    process.exit(1);
  }
}

function validateIntOption(value, option) {
  if (!/^\d+$/.test(value)) {
    throw new Error(
      `Invalid --${option.name} value.\nExpected an integer, but received: ${value}`
    );
  }
}

function validateChoiceOption(value, option) {
  if (!option.choices.some(choice => choice.value === value)) {
    throw new Error(
      `Invalid option for --${option.name}.\nExpected ${getJoinedChoices()}, but received: "${value}"`
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
