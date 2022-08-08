run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["v-flag.js"],
    acorn: ["v-flag.js"],
    espree: ["v-flag.js"],
    meriyah: ["v-flag.js"],
  },
});
