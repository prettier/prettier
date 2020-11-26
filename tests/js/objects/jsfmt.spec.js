run_spec(__dirname, ["babel", "typescript"], {
  errors: {
    espree: [
      "expression.js",
      "invalid-accessor-generator.js",
      "invalid-setter.js",
      "getter-setter.js",
    ],
    typescript: ["expression.js", "invalid-accessor-generator.js"],
    meriyah: [
      "expression.js",
      "invalid-accessor-generator.js",
      "invalid-setter.js",
      "getter-setter.js",
    ],
  },
});
