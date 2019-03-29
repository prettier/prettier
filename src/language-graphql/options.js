"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_GRAPHQL = "GraphQL";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  bracketSpacing: commonOptions.bracketSpacing,
  experimentalFragmentVariables: {
    since: "0.17.0",
    category: CATEGORY_GRAPHQL,
    type: "boolean",
    default: false,
    description: "Enable parsing GraphQL fragment variables."
  }
};
