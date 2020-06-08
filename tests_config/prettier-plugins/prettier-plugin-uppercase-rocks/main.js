"use strict";

const name = "uppercase-rocks";

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => ({ value: text }),
      astFormat: name,
    },
  },
  printers: {
    [name]: {
      print: (path) => path.getValue().value.toUpperCase(),
    },
  },
};
