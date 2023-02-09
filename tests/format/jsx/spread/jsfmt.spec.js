run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["child.js"],
    espree: ["child.js"],
  },
});
