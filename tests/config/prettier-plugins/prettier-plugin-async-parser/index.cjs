"use strict";

const name = "async-parser";

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => Promise.resolve({ text, isAsyncParserPluginAst: true }),
      astFormat: name,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [name]: {
      print(path) {
        if (!path.getNode().isAsyncParserPluginAst) {
          throw new Error("Unexpected parse result.");
        }

        return "Formatted by async-parser plugin";
      },
      massageAstNode() {
        return { text: "AST text value placeholder" };
      },
    },
  },
};
