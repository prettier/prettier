"use strict";

const languages = [
  {
    name: "Raw (no-op)",
    since: "1.13.0",
    parsers: ["raw"]
  }
];

const parsers = {
  raw: {
    parse(text) {
      return { type: "Raw", text: text };
    },
    astFormat: "raw"
  }
};

const printers = {
  raw: {
    print(path) {
      const node = path.getValue();
      switch (node.type) {
        case "Raw": {
          return node.text;
        }
        default: {
          throw new Error("Unknown node type provided to raw printer");
        }
      }
    }
  }
};

module.exports = {
  languages,
  parsers,
  printers
};
