"use strict";

module.exports = {
  parsers: {
    "different-value": {
      parse: text => ({ type: "root", value: text.endsWith("\n") ? 2 : 1 }),
      astFormat: "property-order-ast"
    },
    "property-order": {
      parse: text => text.endsWith("\n")
        ? { type: "root", second: 2, first: 1 }
        : { type: "root", first: 1, second: 2 },
      astFormat: "property-order-ast"
    }
  },
  printers: {
    "property-order-ast": {
      print: () => "formatted\n"
    }
  }
};
