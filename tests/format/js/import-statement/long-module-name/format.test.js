runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["import-defer.js", "import-source.js"],
    espree: ["import-defer.js", "import-source.js"],
    flow: ["import-source.js"],
    typescript: ["import-source.js"],
  },
});
