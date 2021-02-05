"use strict";

const name = "missing-comments";

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => ({ value: text, comments: [{ value: "comment" }] }),
      astFormat: name,
      locStart() {},
      locEnd() {},
    },
  },
  printers: {
    [name]: {
      print() {
        return "comment not printed";
      },
    },
  },
};
