"use strict";

module.exports = {
  languages: [
    {
      name: "package.json",
      parsers: ["json-stringify"],
      filenames: ["package.json"]
    }
  ],
  printers: {
    "estree-json": {
      print: () => "Overridden"
    }
  }
};
