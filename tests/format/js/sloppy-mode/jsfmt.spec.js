run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["function-declaration-in-while.js"],
    acorn: ["function-declaration-in-while.js"],
    espree: ["function-declaration-in-while.js"],
    meriyah: ["function-declaration-in-while.js"],
  },
});
