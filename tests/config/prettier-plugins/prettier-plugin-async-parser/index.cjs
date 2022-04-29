"use strict";

const name = "async-parser";

const isPromise = value => Promise.resolve(value) === value

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => Promise.resolve({text}),
      astFormat: name,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [name]: {
      print(path) {
        if (isPromise(path.getNode())) {
          throw new Error("Unexpected parse result.")
        }

        return "Formatted by async-parser plugin";
      },
    },
  },
};
