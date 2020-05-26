"use strict";

module.exports = {
  languages: [
    {
      name: "uppercase-rocks",
      parsers: ["uppercase-rocks"],
    },
  ],
  parsers: {
    "uppercase-rocks": {
      parse: (text) => ({ value: text }),
      astFormat: "uppercase-rocks",
    },
  },
  printers: {
    "uppercase-rocks": {
      print: (path) => path.getValue().value.trim().toUpperCase(),
    },
  },
};
