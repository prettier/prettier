"use strict";

/** @type {import('prettier')} */
const prettier = require("prettier-local");

function printDoc(doc) {
  // This dummy plugin ignores the input and simply returns the given doc.
  // This is to make sure that the doc will go through all the stages a real doc
  // returned by a real plugin would go (e.g. `propagateBreaks`).
  const dummyPlugin = {
    parsers: {
      dummy: {
        parse: () => ({}),
        astFormat: "dummy",
      },
    },
    printers: {
      dummy: {
        print: () => doc,
      },
    },
  };

  return prettier.format("_", {
    plugins: [dummyPlugin],
    parser: "dummy",
  });
}

module.exports = printDoc;
