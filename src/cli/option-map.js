"use strict";

const dashify = require("dashify");
const { coreOptions } = require("./prettier-internal");

function normalizeDetailedOption(name, option) {
  return {
    category: coreOptions.CATEGORY_OTHER,
    ...option,
    choices:
      option.choices &&
      option.choices.map((choice) => {
        const newChoice = {
          description: "",
          deprecated: false,
          ...(typeof choice === "object" ? choice : { value: choice }),
        };
        /* istanbul ignore next */
        if (newChoice.value === true) {
          newChoice.value = ""; // backward compatibility for original boolean option
        }
        return newChoice;
      }),
  };
}

function normalizeDetailedOptionMap(detailedOptionMap) {
  return Object.fromEntries(
    Object.entries(detailedOptionMap)
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName))
      .map(([name, option]) => [name, normalizeDetailedOption(name, option)])
  );
}

function createDetailedOptionMap(supportOptions) {
  return Object.fromEntries(
    supportOptions.map((option) => {
      const newOption = {
        ...option,
        name: option.cliName || dashify(option.name),
        description: option.cliDescription || option.description,
        category: option.cliCategory || coreOptions.CATEGORY_FORMAT,
        forwardToApi: option.name,
      };

      /* istanbul ignore next */
      if (option.deprecated) {
        delete newOption.forwardToApi;
        delete newOption.description;
        delete newOption.oppositeDescription;
        newOption.deprecated = true;
      }

      return [newOption.name, newOption];
    })
  );
}

module.exports = {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
};
