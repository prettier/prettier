runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["decorator.js"],
    espree: ["decorator.js"],
    hermes: ["decorator.js"],
  },
});
