"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_MARKDOWN = "Markdown";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  proseWrap: commonOptions.proseWrap,
  singleQuote: commonOptions.singleQuote,
  cjkSpacing: {
    since: "2.1.0",
    category: CATEGORY_MARKDOWN,
    type: "choice",
    default: "preserve",
    description: "Print spaces between CJK characters and non-CJK characters.",
    choices: [
      {
        since: "2.1.0",
        value: "always",
        description: "Print spaces wherever between CJK and non-CJK.",
      },
      {
        since: "2.1.0",
        value: "preserve",
        description: "Print spaces as-is.",
      },
    ],
  },
};
