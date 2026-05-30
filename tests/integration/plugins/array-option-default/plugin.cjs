"use strict";

// Regression fixture for #19012: a plugin option with `array: true` and a
// `default` value must not throw "Expected an array of ..., but received
// undefined" when the option is left unset.
module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"],
    },
  ],
  options: {
    fooArrayOption: {
      type: "path",
      array: true,
      default: [{ value: ["default-value"] }],
      description: "foo array option",
    },
  },
  parsers: {
    "foo-parser": {
      parse: (text) => ({ text }),
      astFormat: "foo-ast",
    },
  },
  printers: {
    "foo-ast": {
      print: (path, options) =>
        JSON.stringify({ fooArrayOption: options.fooArrayOption }),
    },
  },
};
