run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["await-keyword.js"],
    espree: ["await-keyword.js"],
    meriyah: ["await-keyword.js"],
  },
});
