"use strict";

const {
  utils: { partition },
} = require("../prettier-internal.js");

module.exports = function createMinimistOptions(detailedOptions) {
  const [boolean, string] = partition(
    detailedOptions,
    ({ type }) => type === "boolean"
  ).map((detailedOptions) =>
    detailedOptions.flatMap(({ name, alias }) =>
      alias ? [name, alias] : [name]
    )
  );

  const defaults = Object.fromEntries(
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
