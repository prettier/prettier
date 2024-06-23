runFormatTest(import.meta, ["babel", "flow"], {
  trailingComma: "es5",
  errors: {
    acorn: ["non-octal-eight-and-nine.js"],
    espree: ["non-octal-eight-and-nine.js"],
  },
});
runFormatTest(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  errors: {
    acorn: ["non-octal-eight-and-nine.js"],
    espree: ["non-octal-eight-and-nine.js"],
  },
});
