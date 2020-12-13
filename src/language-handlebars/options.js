"use strict";

const CATEGORY_HANDLEBARS = "Handlebars";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  htmlWhitespaceSensitivity: {
    since: "2.2.1",
    category: CATEGORY_HANDLEBARS,
    type: "choice",
    default: "ignore",
    description: "How to handle whitespaces in Handlebars.",
    choices: [
      // {
      //   value: "strict",
      //   description: "Whitespaces are considered sensitive.",
      // },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive.",
      },
    ],
  },
};
