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
    baz: {
      async print(path) {
        const { default: prettier } = await import(
          "../../../config/prettier-entry.js"
        );
        const { concat } = prettier.doc.builders;
        return concat(["content from `prettier-plugin-baz.js` file + ", path.getValue().text]);
      },
    },
  },
  defaultOptions: {
    tabWidth: 4,
  },
};

export default plugin;
