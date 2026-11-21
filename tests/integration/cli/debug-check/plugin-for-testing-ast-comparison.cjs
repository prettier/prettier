"use strict";

module.exports = {
  parsers: {
    "debug-check-ast-comparison": {
      astFormat: "debug-check-ast-comparison",
      parse(text) {
        const value = text.trim();
        return text.endsWith("\n")
          ? { type: "Text", value }
          : { value, type: "Text" };
      },
    },
  },
  printers: {
    "debug-check-ast-comparison": {
      print: ({ node }) => node.value.split(" ", 1)[0] + "\n",
    },
  },
};
