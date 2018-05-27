"use strict";

const {
  doc: {
    builders: { concat }
  }
} = require("prettier/local");

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
