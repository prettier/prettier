"use strict";

const leven = require("leven");
const validator = require("./options-validator");
const descriptors = require("./options-descriptor");

function normalizeOptions(options, optionInfos, opts) {
  opts = opts || {};
  const logger =
    opts.logger === false
      ? { warn() {} }
      : opts.logger !== undefined ? opts.logger : console;
  const descriptor = opts.descriptor || descriptors.apiDescriptor;
  const passThrough = opts.passThrough || [];

  const optionInfoMap = optionInfos.reduce(
    (reduced, optionInfo) =>
      Object.assign(reduced, { [optionInfo.name]: optionInfo }),
    {}
  );
  const normalizedOptions = Object.keys(options).reduce((newOptions, key) => {
    const optionInfo = optionInfoMap[key];

    let optionName = key;
    let optionValue = options[key];

    if (!optionInfo) {
      if (passThrough === true || passThrough.indexOf(optionName) !== -1) {
        newOptions[optionName] = optionValue;
      } else {
        logger.warn(
          createUnknownOptionMessage(
            optionName,
            optionValue,
            optionInfos,
            descriptor
          )
        );
      }
      return newOptions;
    }

    if (!optionInfo.deprecated) {
      optionValue = normalizeOption(optionValue, optionInfo);
    } else if (typeof optionInfo.redirect === "string") {
      logger.warn(createRedirectOptionMessage(optionInfo, descriptor));
      optionName = optionInfo.redirect;
    } else if (optionValue) {
      logger.warn(createRedirectOptionMessage(optionInfo, descriptor));
      optionValue = optionInfo.redirect.value;
      optionName = optionInfo.redirect.option;
    }

    if (optionInfo.choices) {
      const choiceInfo = optionInfo.choices.find(
        choice => choice.value === optionValue
      );
      if (choiceInfo && choiceInfo.deprecated) {
        logger.warn(
          createRedirectChoiceMessage(optionInfo, choiceInfo, descriptor)
        );
        optionValue = choiceInfo.redirect;
      }
    }

    if (optionInfo.array && !Array.isArray(optionValue)) {
      optionValue = [optionValue];
    }

    if (optionValue !== optionInfo.default) {
      validator.validateOption(optionValue, optionInfoMap[optionName], {
        descriptor
      });
    }

    newOptions[optionName] = optionValue;
    return newOptions;
  }, {});

  return normalizedOptions;
}

function normalizeOption(option, optionInfo) {
  return optionInfo.type === "int" ? Number(option) : option;
}

function createUnknownOptionMessage(key, value, optionInfos, descriptor) {
  const messages = [`Ignored unknown option ${descriptor(key, value)}.`];

  const suggestedOptionInfo = optionInfos.find(
    optionInfo => leven(optionInfo.name, key) < 3
  );
  if (suggestedOptionInfo) {
    messages.push(`Did you mean ${JSON.stringify(suggestedOptionInfo.name)}?`);
  }

  return messages.join(" ");
}

function createRedirectOptionMessage(optionInfo, descriptor) {
  return `${descriptor(
    optionInfo.name
  )} is deprecated. Prettier now treats it as ${
    typeof optionInfo.redirect === "string"
      ? descriptor(optionInfo.redirect)
      : descriptor(optionInfo.redirect.option, optionInfo.redirect.value)
  }.`;
}

function createRedirectChoiceMessage(optionInfo, choiceInfo, descriptor) {
  return `${descriptor(
    optionInfo.name,
    choiceInfo.value
  )} is deprecated. Prettier now treats it as ${descriptor(
    optionInfo.name,
    choiceInfo.redirect
  )}.`;
}

function normalizeApiOptions(options, optionInfos, opts) {
  return normalizeOptions(
    options,
    optionInfos,
    Object.assign({ descriptor: descriptors.apiDescriptor }, opts)
  );
}

function normalizeCliOptions(options, optionInfos, opts) {
  const args = options["_"] || [];

  const newOptions = normalizeOptions(
    Object.keys(options).reduce(
      (reduced, key) =>
        Object.assign(
          reduced,
          key.length === 1 // omit alias
            ? null
            : { [key]: options[key] }
        ),
      {}
    ),
    optionInfos,
    Object.assign({ descriptor: descriptors.cliDescriptor }, opts)
  );
  newOptions["_"] = args;

  return newOptions;
}

module.exports = {
  normalizeApiOptions,
  normalizeCliOptions
};
