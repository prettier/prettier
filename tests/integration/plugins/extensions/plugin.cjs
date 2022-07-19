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
      async print(path) {
        const { default: prettier } = await import(
          "../../../config/prettier-entry.js"
        );
        const { concat } = prettier.doc.builders;
        return concat(["!", path.getValue().text]);
      },
    },
  },
};
