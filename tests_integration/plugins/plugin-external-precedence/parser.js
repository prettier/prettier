"use strict";

module.exports = {
  languages: [
    {
      name: "package.json",
      parsers: ["estree-json"],
      filenames: ["package.json"]
    }
  ],
  parsers: {
    "estree-json": {
      astFormat: "estree-json",
      parse: () => ({
        type: "StringLiteral",
        extra: [],
        value: "Custom parsed",
        tokens: []
      })
    }
  }
};
