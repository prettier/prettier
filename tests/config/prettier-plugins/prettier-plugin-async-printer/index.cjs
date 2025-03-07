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
      parse: (text) => Promise.resolve(JSON.parse(text)),
      astFormat: name,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [name]: {
      preprocess(ast) {
        return Promise.resolve({
          ...ast,
          preprocess: ast.preprocess?.toLowerCase() ?? "",
        });
      },
      print(path) {
        const ast = path.getValue();
        // print may be async if not used recursively
        return Promise.resolve(
          JSON.stringify({
            ...ast,
            print: ast.print?.replace(/\s+/gu, " ") ?? "",
          }),
        );
      },
      massageAstNode() {
        return { text: "AST text value placeholder" };
      },
    },
  },
};
