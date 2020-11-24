run_spec(__dirname, ["babel"], {
  errors: {
    espree: ["newline-before-arrow.js"],
    meriyah: ["newline-before-arrow.js"],
  },
});
