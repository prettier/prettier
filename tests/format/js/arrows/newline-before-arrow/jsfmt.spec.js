run_spec(import.meta, ["babel"], {
  errors: {
    espree: ["newline-before-arrow.js"],
    meriyah: ["newline-before-arrow.js"],
  },
});
