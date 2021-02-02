"use strict";

const commonOptions = require("../common/common-options");

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  singleQuote: commonOptions.singleQuote,
  // [prettierx]
  cssParenSpacing: {
    category: "Other", // CATEGORY_OTHER
    type: "boolean",
    default: false,
    description:
      "Print spaces between parens in CSS, WordPress style. Status: experimental, with limited testing.",
  },
};
