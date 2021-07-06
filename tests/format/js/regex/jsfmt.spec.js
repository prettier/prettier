run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["d-flag.js"],
    espree: ["d-flag.js"],
    meriyah: ["d-flag.js"],
  },
});
