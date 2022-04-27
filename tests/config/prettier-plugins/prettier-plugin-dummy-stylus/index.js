"use strict";

const parserName = "stylus-dummy-parser";
const astName = parserName + "-ast";

module.exports = {
  languages: [
    {
      name: "stylus",
      parsers: [parserName],
    },
  ],
  parsers: {
    [parserName]: {
      parse: (text) => ({ text }),
      astFormat: astName,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [astName]: {
      print(path) {
        return path.getValue().text.replace(/;/g, "");
      },
    },
  },
};
