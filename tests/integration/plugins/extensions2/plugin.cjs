"use strict";

module.exports = {
  languages: [
    {
      name: "bar",
      parsers: ["bar-parser"],
      extensions: [".bar"],
    },
  ],
  parsers: {
    "bar-parser": {
      parse: (text) => ({ text }),
      astFormat: "bar-ast",
    },
  },
  printers: {
    "bar-ast": {
      print(path) {
        return ["!", path.getValue().text];
      },
    },
  },
};
