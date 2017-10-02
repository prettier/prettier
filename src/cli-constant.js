"use strict";

const camelCase = require("camelcase");
const optionsDefinitions = require("./options-definitions");
const categories = require("./options-categories").categories;

const detailedOptions = normalizeDetailedOptions(optionsDefinitions);

const minimistOptions = {
  boolean: detailedOptions
    .filter(option => option.type === "boolean")
    .map(option => option.name),
  string: detailedOptions
    .filter(option => option.type !== "boolean")
    .map(option => option.name),
  default: detailedOptions
    .filter(option => option.default !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.default }, current),
      {}
    ),
  alias: detailedOptions
    .filter(option => option.alias !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.alias }, current),
      {}
    ),
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn(`Ignored unknown option: ${param}\n`);
      return false;
    }
  }
};

const usageSummary = `
Usage: prettier [options] [file/glob ...]

By default, output is written to stdout.
Stdin is read if it is piped to Prettier and no files are given.
`.trim();

function normalizeDetailedOptions(rawDetailedOptions) {
  const names = Object.keys(rawDetailedOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailedOptions[name];
    return Object.assign({}, option, {
      name,
      category: option.category || categories.OTHER,
      forwardToApi:
        option.forwardToApi &&
        (typeof option.forwardToApi === "string"
          ? option.forwardToApi
          : camelCase(name)),
      choices:
        option.choices &&
        option.choices.map(choice =>
          Object.assign(
            { description: "", deprecated: false },
            typeof choice === "object" ? choice : { value: choice }
          )
        ),
      getter: option.getter || (value => value)
    });
  });

  return normalized;
}

const detailedOptionMap = detailedOptions.reduce(
  (current, option) => Object.assign(current, { [option.name]: option }),
  {}
);

module.exports = {
  minimistOptions,
  detailedOptions,
  detailedOptionMap,
  usageSummary
};
