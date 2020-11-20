run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    espree: ["invalid-const.js"],
    flow: ["invalid-const.js"],
    meriyah: ["invalid-const.js"],
  },
});
