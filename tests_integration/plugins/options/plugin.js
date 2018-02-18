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
    fooOption: {
      type: "choice",
      default: "bar",
      description: "foo description",
      choices: [
        {
          value: "bar",
          description: "bar description"
        },
        {
          value: "baz",
          description: "baz description"
        }
      ]
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
        options.fooOption ? `foo:${options.fooOption}` : path.getValue().text
    }
  }
};
