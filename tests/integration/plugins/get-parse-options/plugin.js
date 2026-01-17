const name = "get-parse-options";

export { name as __plugin_internal_name };

export const languages = [
  {
    name,
    parsers: [name],
    extensions: [`.${name}`],
  },
];

export const parsers = {
  [name]: {
    astFormat: name,
    parse: (_, options) => options,
  },
};

// Adding this since `prettier.__debug.parse` requires the printer exists
export const printers = {
  [name]: {
    print() {
      throw new Error("This should not be called");
    },
  },
};
