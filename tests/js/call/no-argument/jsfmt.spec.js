run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    espree: ["import.js"],
    meriyah: ["import.js"],
    flow: ["import.js"],
    typescript: ["import.js"],
  },
});
