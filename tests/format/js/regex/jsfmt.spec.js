run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["d-flag.js", "v-flag.js"],
    acorn: ["v-flag.js"],
    espree: ["v-flag.js"],
    meriyah: ["d-flag.js", "v-flag.js"],
  },
});
