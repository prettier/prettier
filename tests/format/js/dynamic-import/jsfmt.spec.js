run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js"],
    espree: ["assertions.js"],
    meriyah: ["assertions.js"],
  },
});
