run_spec(__dirname, ["babel", "typescript"], {
  errors: {
    acorn: ["expression.js"],
    espree: ["expression.js"],
    typescript: ["expression.js"],
    meriyah: ["expression.js"],
  },
});
