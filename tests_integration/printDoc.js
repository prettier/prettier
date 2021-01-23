"use strict";

/** @type {import('prettier')} */
const prettier = require("prettier-local");

function printDoc(doc) {
  return prettier.format("_", {
    plugins: [
      {
        parsers: {
          doc: {
            parse: () => doc,
            astFormat: "doc",
          },
        },
        printers: {
          doc: {
            print: (path) => path.getValue(),
          },
        },
        languages: [{ name: "doc", parsers: ["doc"] }],
      },
    ],
    parser: "doc",
  });
}

module.exports = printDoc;
