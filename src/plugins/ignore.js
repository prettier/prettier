export const parsers = {
  ignore: {
    astFormat: "passthrough",
    parse(text) {
      return { text };
    },
    locStart() {},
    locEnd() {},
  },
};
export const printers = {
  passthrough: {
    print(path) {
      return path.getValue().text;
    },
  },
};
