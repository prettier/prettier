"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_MARKDOWN = "Markdown";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  proseWrap: {
    since: "1.8.2",
    category: CATEGORY_MARKDOWN,
    type: "choice",
    default: [
      { since: "1.8.2", value: true },
      { since: "1.9.0", value: "preserve" }
    ],
    description: "How to wrap prose. (markdown)",
    choices: [
      {
        since: "1.9.0",
        value: "always",
        description: "Wrap prose if it exceeds the print width."
      },
      {
        since: "1.9.0",
        value: "never",
        description: "Do not wrap prose."
      },
      {
        since: "1.9.0",
        value: "preserve",
        description: "Wrap prose as-is."
      },
      { value: false, deprecated: "1.9.0", redirect: "never" },
      { value: true, deprecated: "1.9.0", redirect: "always" }
    ]
  },
  singleQuote: commonOptions.singleQuote
};
