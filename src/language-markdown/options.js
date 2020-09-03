"use strict";

const { outdent } = require("outdent");
const commonOptions = require("../common/common-options");

const CATEGORY_MARKDOWN = "Markdown";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  proseWrap: commonOptions.proseWrap,
  singleQuote: commonOptions.singleQuote,
  insertCjSpacing: {
    since: "2.1.2",
    category: CATEGORY_MARKDOWN,
    type: "boolean",
    default: true, // transitional measure until a plugin to shoulder this feature becomes available
    description: outdent`
      Insert spaces wherever between Chinese or Japanese and non-CJK.
    `,
  },
};
