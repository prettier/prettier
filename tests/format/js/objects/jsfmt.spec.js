run_spec(__dirname, ["babel", "typescript"], {
  errors: {
    espree: ["expression.js"],
    typescript: ["expression.js"],
    meriyah: ["expression.js"],
  },
});
