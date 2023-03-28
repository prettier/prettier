run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["v-flag.js"],
    acorn: ["v-flag.js", "regexp-modifiers.js"],
    espree: ["v-flag.js", "regexp-modifiers.js"],
    meriyah: ["v-flag.js", "regexp-modifiers.js"],
  },
});
