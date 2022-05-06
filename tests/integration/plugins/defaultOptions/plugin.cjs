"use strict";

module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"]
    }
  ],
  defaultOptions: {
    tabWidth: 8,
    bracketSpacing: false
  },
  parsers: {
    "foo-parser": {
      parse: text => ({ text }),
      astFormat: "foo-ast"
    }
  },
  printers: {
    "foo-ast": {
      print: (path, options) =>
        JSON.stringify({
          tabWidth: options.tabWidth,
          bracketSpacing: options.bracketSpacing
        })
    }
  }
};
