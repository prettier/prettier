"use strict";

module.exports = {
  languages: [
    {
      name: "debug-check",
      parsers: ["debug-check-parser"],
      extensions: [".debug-check"]
    }
  ],
  parsers: {
    "debug-check-parser": {
      parse: text => ({ text }),
      astFormat: "debug-check-ast"
    }
  },
  printers: {
    "debug-check-ast": {
      print: path => path.getValue().text + path.getValue().text
    }
  }
};
