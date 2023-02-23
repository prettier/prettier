run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["decorator.js"],
    espree: ["decorator.js"],
  },
});
