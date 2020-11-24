run_spec(__dirname, ["babel"], {
  errors: {
    espree: [
      "expression.js",
      "invalid-accessor-generator.js",
      "invalid-setter.js",
    ],
    meriyah: [
      "expression.js",
      "invalid-accessor-generator.js",
      "invalid-setter.js",
    ],
  },
});
