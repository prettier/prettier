"use strict";

module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"],
      since: "1.0.0",
    },
  ],
  parsers: {
    "foo-parser": {
      preprocess: (text) => Promise.resolve(`preprocessed:async:${text}`),
      parse: (text) => ({ text }),
      astFormat: "foo-ast",
    },
  },
  printers: {
    "foo-ast": {
      print: ({ node }) => node.text,
    },
  },
};
