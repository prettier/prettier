export const parsers = {
  ignore: {
    astFormat: "passthrough",
    parse() {
      return {};
    },
    locStart() {},
    locEnd() {},
  },
};
export const printers = {
  passthrough: {
    hasPrettierIgnore() {
      return true;
    },
    print() {
      throw new Error("Not implemented");
    },
  },
};
