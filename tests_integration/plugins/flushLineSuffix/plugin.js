"use strict";

const prettier = require("prettier-local");
const { lineSuffix } = prettier.doc.builders;

module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"]
    }
  ],
  parsers: {
    "foo-parser": {
      parse: text => ({ text }),
      astFormat: "foo-ast"
    }
  },
  printers: {
    "foo-ast": {
      print: path => lineSuffix(path.getValue().text.trim())
    }
  }
};
