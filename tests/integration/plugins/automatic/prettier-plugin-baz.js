const plugin = {
  languages: [
    {
      name: "baz",
      parsers: ["baz"],
    },
  ],
  parsers: {
    baz: {
      parse: text => ({ text }),
      astFormat: "baz",
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

export default plugin;
