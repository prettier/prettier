"use strict";

const dedent = require("dedent");
const dashify = require("dashify");
const getSupportInfo = require("../common/support").getSupportInfo;
const options = require("./options");

const CATEGORY_CONFIG = "Config";
const CATEGORY_EDITOR = "Editor";
const CATEGORY_FORMAT = "Format";
const CATEGORY_OTHER = "Other";
const CATEGORY_OUTPUT = "Output";

const categoryOrder = [
  CATEGORY_OUTPUT,
  CATEGORY_FORMAT,
  CATEGORY_CONFIG,
  CATEGORY_EDITOR,
  CATEGORY_OTHER
];

const detailedOptions = normalizeDetailedOptions(
  Object.assign(
    getSupportInfo(null, {
      showDeprecated: true,
      showUnreleased: true
    }).options.reduce((reduced, option) => {
      const newOption = Object.assign({}, option, {
        name: dashify(option.name),
        forwardToApi: option.name
      });

      switch (option.name) {
        case "filepath":
          Object.assign(newOption, {
            name: "stdin-filepath",
            description: "Path to the file to pretend that stdin comes from."
          });
          break;
        case "useFlowParser":
          newOption.name = "flow-parser";
          break;
        case "plugins":
          newOption.name = "plugin";
          break;
      }

      switch (newOption.name) {
        case "cursor-offset":
        case "range-start":
        case "range-end":
          newOption.category = CATEGORY_EDITOR;
          break;
        case "stdin-filepath":
        case "insert-pragma":
        case "require-pragma":
          newOption.category = CATEGORY_OTHER;
          break;
        case "plugin":
          newOption.category = CATEGORY_CONFIG;
          break;
        default:
          newOption.category = CATEGORY_FORMAT;
          break;
      }

      if (option.deprecated) {
        delete newOption.forwardToApi;
        delete newOption.description;
        delete newOption.oppositeDescription;
        newOption.deprecated = true;
      }

      return Object.assign(reduced, { [newOption.name]: newOption });
    }, {}),
    options
  )
);

const minimistOptions = {
  boolean: detailedOptions
    .filter(option => option.type === "boolean")
    .map(option => option.name),
  string: detailedOptions
    .filter(option => option.type !== "boolean")
    .map(option => option.name),
  default: detailedOptions
    .filter(option => !option.deprecated)
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
    )
};

const usageSummary = dedent`
  Usage: prettier [options] [file/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

function normalizeDetailedOptions(rawDetailedOptions) {
  const names = Object.keys(rawDetailedOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailedOptions[name];
    return Object.assign({}, option, {
      name,
      category: option.category || CATEGORY_OTHER,
      choices:
        option.choices &&
        option.choices.map(choice => {
          const newChoice = Object.assign(
            { description: "", deprecated: false },
            typeof choice === "object" ? choice : { value: choice }
          );
          if (newChoice.value === true) {
            newChoice.value = ""; // backward compability for original boolean option
          }
          return newChoice;
        })
    });
  });

  return normalized;
}

const detailedOptionMap = detailedOptions.reduce(
  (current, option) => Object.assign(current, { [option.name]: option }),
  {}
);

const apiDetailedOptionMap = detailedOptions.reduce(
  (current, option) =>
    option.forwardToApi && option.forwardToApi !== option.name
      ? Object.assign(current, { [option.forwardToApi]: option })
      : current,
  {}
);

module.exports = {
  categoryOrder,
  minimistOptions,
  detailedOptions,
  detailedOptionMap,
  apiDetailedOptionMap,
  usageSummary
};
