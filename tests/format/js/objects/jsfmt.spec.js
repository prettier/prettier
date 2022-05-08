run_spec(import.meta, ["babel", "typescript"], {
  errors: {
    acorn: ["expression.js"],
    espree: ["expression.js"],
    typescript: ["expression.js"],
    meriyah: ["expression.js"],
  },
});
