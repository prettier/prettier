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

function validateIntOption(value, option, opts) {
  if (opts && opts.exceptions && opts.exceptions.indexOf(value) !== -1) {
    return;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(
      `Invalid --${option.name} value.\nExpected an integer, but received: ${value}`
    );
  }
}

function validateChoiceOption(value, option, opts) {
  if (option.choices.indexOf(value) === -1) {
    throw new Error(
      `Invalid option for --${option.name}.\nExpected ${getJoinedChoices()}, but received: "${value}"`
    );
  }

  function getJoinedChoices() {
    const choices = option.choices.map(choice => `"${choice}"`);
    if (choices.length === 1) {
      return choices[0];
    }
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
