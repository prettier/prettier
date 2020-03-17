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
  options: {
    fooString: {
      type: "string",
      default: "bar",
      description: "foo description"
    }
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
        options.fooString ? `foo:${options.fooString}` : path.getValue().text
    }
  }
};
