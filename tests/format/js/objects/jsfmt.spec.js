run_spec(import.meta, ["babel", "typescript"], {
  errors: {
    espree: ["expression.js"],
    typescript: ["expression.js"],
    meriyah: ["expression.js"],
  },
});
