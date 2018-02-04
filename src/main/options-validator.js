"use strict";

const descriptors = require("./options-descriptor");

function validateOption(value, optionInfo, opts) {
  opts = opts || {};
  const descriptor = opts.descriptor || descriptors.apiDescriptor;

  if (
    typeof optionInfo.exception === "function" &&
    optionInfo.exception(value)
  ) {
    return;
  }

  try {
    validateOptionType(value, optionInfo);
  } catch (error) {
    throw new Error(
      `Invalid \`${descriptor(optionInfo.name)}\` value. ${
        error.message
      }, but received \`${JSON.stringify(value)}\`.`
    );
  }
}

function validateOptionType(value, optionInfo) {
  if (optionInfo.array) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected an array`);
    }
    value.forEach(v =>
      validateOptionType(v, Object.assign({}, optionInfo, { array: false }))
    );
  } else {
    switch (optionInfo.type) {
      case "int":
        validateIntOption(value);
        break;
      case "boolean":
        validateBooleanOption(value);
        break;
      case "choice":
        validateChoiceOption(value, optionInfo.choices);
        break;
    }
  }
}

function validateBooleanOption(value) {
  if (typeof value !== "boolean") {
    throw new Error(`Expected a boolean`);
  }
}

function validateIntOption(value) {
  if (
    !(
      typeof value === "number" &&
      Math.floor(value) === value &&
      value >= 0 &&
      value !== Infinity
    )
  ) {
    throw new Error(`Expected an integer`);
  }
}

function validateChoiceOption(value, choiceInfos) {
  if (!choiceInfos.some(choiceInfo => choiceInfo.value === value)) {
    const choices = choiceInfos
      .filter(choiceInfo => !choiceInfo.deprecated)
      .map(choiceInfo => JSON.stringify(choiceInfo.value))
      .sort();
    const head = choices.slice(0, -2);
    const tail = choices.slice(-2);
    throw new Error(`Expected ${head.concat(tail.join(" or ")).join(", ")}`);
  }
}

module.exports = { validateOption };
