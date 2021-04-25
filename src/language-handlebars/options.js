"use strict";

const CATEGORY_HANDLEBARS = "Handlebars";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
module.exports = {
  insertFinalNewline: {
    since: "2.3.0",
    category: CATEGORY_HANDLEBARS,
    type: "boolean",
    default: false,
    description: "Insert a final newline instead of removing it.",
  },
};
