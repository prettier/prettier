"use strict";

/* global prettier */

self.prettierPlugins = Object.assign(self.prettierPlugins || {}, {
  docExplorer: {
    parsers: {
      "prettier-doc": {
        parse: (text) =>
          new Function(
            `{ ${Object.keys(prettier.doc.builders)} }`,
            `const result = ${text || "''"}; return result;`
          )(prettier.doc.builders),
        astFormat: "prettier-doc",
      },
    },
    printers: {
      "prettier-doc": {
        print: (path) => path.getValue(),
      },
    },
    languages: [{ name: "prettier-doc", parsers: ["prettier-doc"] }],
  },
});
