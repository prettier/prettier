"use strict";

const prettier = require("../../../config/require-prettier.js");
const { concat } = prettier.doc.builders;

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
      print: path => concat(["!", path.getValue().text])
    }
  }
};
