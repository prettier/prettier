"use strict";

module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"],
      since: "1.0.0"
    }
  ],
  defaultOptions: {
    tabWidth: 8
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
        options.tabWidth ? `tabWidth:${options.tabWidth}` : path.getValue().text
    }
  }
};
