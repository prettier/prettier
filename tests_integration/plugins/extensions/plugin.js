"use strict";

const prettier = require("../../../tests_config/require_prettier");
const concat = prettier.doc.builders.concat;

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
