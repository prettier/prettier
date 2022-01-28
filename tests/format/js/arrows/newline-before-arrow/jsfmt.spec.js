run_spec(__dirname, ["babel"], {
  errors: {
    acorn: ["newline-before-arrow.js"],
    espree: ["newline-before-arrow.js"],
    meriyah: ["newline-before-arrow.js"],
  },
});
