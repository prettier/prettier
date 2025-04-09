"use strict";

module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"],
    },
  ],
  parsers: {
    "foo-parser": {
      parse: (text) => ({ text }),
      astFormat: "foo-ast",
    },
  },
  printers: {
    "foo-ast": {
      print(path) {
        // TODO[@fisker]: Use `lineSuffix` after we support ESM plugin
        return { type: "line-suffix", contents: path.getValue().text.trim() };
      },
    },
  },
};
