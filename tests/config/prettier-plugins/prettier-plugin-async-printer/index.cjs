"use strict";

const name = "async-printer";

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => Promise.resolve({ text, isAsyncPrinterPluginAst: true }),
      astFormat: name,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [name]: {
      preprocess(ast) {
        return Promise.resolve({ ...ast, text: ast.text.toLowerCase() });
      },
      print(path) {
        if (!path.getNode().isAsyncPrinterPluginAst) {
          throw new Error("Unexpected parse result.");
        }

        // print may be async if not used recursively
        return Promise.resolve(path.getNode().text.replace(/\s+/g, " "));
      },
      massageAstNode() {
        return { text: "AST text value placeholder" };
      },
    },
  },
};
