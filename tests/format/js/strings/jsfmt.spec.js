run_spec(__dirname, ["babel", "flow"], {
  errors: {
    acorn: ["non-octal-eight-and-nine.js"],
    espree: ["non-octal-eight-and-nine.js"],
  },
});
run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "all",
  errors: {
    acorn: ["non-octal-eight-and-nine.js"],
    espree: ["non-octal-eight-and-nine.js"],
  },
});
