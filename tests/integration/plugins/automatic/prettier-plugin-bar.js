"use strict";

module.exports = {
  languages: [
    {
      name: "bar",
      parsers: ["bar"],
    },
  ],
  parsers: {
    bar: {
      parse: (text) => ({ text }),
      astFormat: "bar",
    },
  },
  printers: {
    bar: {
      print(path) {
        return [
          "content from `prettier-plugin-bar.js` file + ",
          path.getValue().text,
        ];
      },
    },
  },
  defaultOptions: {
    tabWidth: 4,
  },
};
