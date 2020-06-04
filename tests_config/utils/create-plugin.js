"use strict";

function createPlugin({ name, print }) {
  return {
    languages: [
      {
        name,
        parsers: [name],
      },
    ],
    parsers: {
      [name]: {
        parse: (text) => ({ value: text }),
        astFormat: [name],
      },
    },
    printers: {
      [name]: {
        print: (path) => print(path.getValue().value),
      },
    },
  };
}

module.exports = createPlugin;
