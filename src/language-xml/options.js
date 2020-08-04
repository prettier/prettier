"use strict";

module.exports = {
  xmlSelfClosingSpace: {
    type: "boolean",
    category: "XML",
    default: true,
    description: "Adds a space before self-closing tags.",
  },
  xmlWhitespaceSensitivity: {
    type: "choice",
    category: "XML",
    default: "strict",
    description: "How to handle whitespaces in XML.",
    choices: [
      {
        value: "strict",
        description: "Whitespaces are considered sensitive in all elements.",
      },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive in all elements.",
      },
    ],
  },
};
