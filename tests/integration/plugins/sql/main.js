"use strict";

const prettier = require("prettier-local");
const concat = prettier.doc.builders.concat;

module.exports = {
  languages: [
    {
      name: "sql",
      parsers: ["sql"]
    }
  ],
  parsers: {
    sql: {
      parse: text => ({ text }),
      astFormat: "sql"
    }
  },
  printers: {
    sql: {
      print: path => concat(["sql+", path.getValue().text])
    }
  }
};
