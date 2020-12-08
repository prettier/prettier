"use strict";

const partition = require("lodash/partition");
const flat = require("lodash/flatten");
const fromPairs = require("lodash/fromPairs");

module.exports = function createMinimistOptions(detailedOptions) {
  const [boolean, string] = partition(
    detailedOptions,
    ({ type }) => type === "boolean"
  ).map((detailedOptions) =>
    flat(
      detailedOptions.map(({ name, alias }) => (alias ? [name, alias] : [name]))
    )
  );

  const defaults = fromPairs(
    detailedOptions
      .filter(
        (option) =>
          !option.deprecated &&
          (!option.forwardToApi ||
            option.name === "plugin" ||
            option.name === "plugin-search-dir") &&
          option.default !== undefined
      )
      .map((option) => [option.name, option.default])
  );

  return {
    // we use vnopts' AliasSchema to handle aliases for better error messages
    alias: {},
    boolean,
    string,
    default: defaults,
  };
};
