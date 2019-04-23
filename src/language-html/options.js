"use strict";

const CATEGORY_HTML = "HTML";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  htmlWhitespaceSensitivity: {
    since: "1.15.0",
    category: CATEGORY_HTML,
    type: "choice",
    default: "css",
    description: "How to handle whitespaces in HTML.",
    choices: [
      {
        value: "css",
        description: "Respect the default value of CSS display property."
      },
      {
        value: "strict",
        description: "Whitespaces are considered sensitive."
      },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive."
      }
    ]
  },
  htmlTopLevelIndent: {
    since: "1.18.0",
    category: CATEGORY_HTML,
    type: "choice",
    default: "auto",
    description: "How to handle top-level indent in HTML.",
    choices: [
      {
        value: "always",
        description:
          "Always apply top-level indent for templates, scripts and styles."
      },
      {
        value: "never",
        description: "Avoid top-level indent for templates, scripts and styles."
      },
      {
        value: "auto",
        description:
          "Avoid top-level indent for scripts and styles inside Vue files."
      }
    ]
  }
};
