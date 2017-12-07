"use strict";

const leven = require("leven");
const validator = require("./options-validator");

function normalizeOptions(options, optionInfos, opts) {
  opts = opts || {};
  const logger =
    opts.logger === false
      ? { warn() {} }
      : opts.logger !== undefined ? opts.logger : console;
  const exception = opts.exception || {};

  const optionInfoMap = optionInfos.reduce(
    (reduced, optionInfo) =>
      Object.assign(reduced, { [optionInfo.name]: optionInfo }),
    {}
  );
  const normalizedOptions = Object.keys(options).reduce((newOptions, key) => {
    const optionInfo = optionInfoMap[key];

    if (!optionInfo) {
      logger.warn(createUnknownOptionMessage(key, optionInfos));
      return newOptions;
    }

    let optionName = key;
    let optionValue = options[key];

    if (optionValue !== optionInfo.default) {
      if (!optionInfo.deprecated) {
        optionValue = normalizeOption(optionValue, optionInfo);
      } else {
        logger.warn(createRedirectOptionMessage(optionInfo));
        if (typeof optionInfo.redirect === "object") {
          optionValue = optionInfo.redirect.value;
          optionName = optionInfo.redirect.option;
        } else {
          optionName = optionInfo.redirect;
        }
      }

      if (optionInfo.choices) {
        const choiceInfo = optionInfo.choices.find(
          choice => choice.value === optionValue
        );
        if (choiceInfo && choiceInfo.deprecated) {
          logger.warn(createRedirectChoiceMessage(optionInfo, choiceInfo));
          optionValue = choiceInfo.redirect;
        }
      }

      const validateOpts = {};
      if (optionName in exception) {
        validateOpts.exception = exception[optionName];
      }

      validator.validateOption(optionValue, optionInfo, validateOpts);
    }

    newOptions[optionName] = optionValue;
    return newOptions;
  }, {});

  return normalizedOptions;
}

function normalizeOption(option, optionInfo) {
  return optionInfo.type === "int" ? Number(option) : option;
}

function createUnknownOptionMessage(key, optionInfos) {
  const messages = [`Ignore unknown option ${JSON.stringify(key)}.`];

  const suggestedOptionInfo = optionInfos.find(
    optionInfo => leven(optionInfo.name, key) < 3
  );
  if (suggestedOptionInfo) {
    messages.push(`Did you mean ${JSON.stringify(suggestedOptionInfo.name)}?`);
  }

  return messages.join(" ");
}

function createRedirectOptionMessage(optionInfo) {
  return `Option ${JSON.stringify(
    optionInfo.name
  )} is deprecated. Prettier now treats it as ${
    typeof optionInfo.redirect === "string"
      ? JSON.stringify(optionInfo.redirect)
      : JSON.stringify(optionInfo.redirect.option) +
        " with " +
        JSON.stringify(optionInfo.redirect.value)
  }.`;
}

function createRedirectChoiceMessage(optionInfo, choiceInfo) {
  return `Option ${JSON.stringify(optionInfo.name)} with value ${JSON.stringify(
    choiceInfo.value
  )} is deprecated. Prettier now treats it as ${JSON.stringify(
    optionInfo.redirect
  )}.`;
}

module.exports = { normalizeOptions };
