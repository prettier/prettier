run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js"],
    espree: ["assertions.js"],
    meriyah: ["assertions.js"],
  },
});
