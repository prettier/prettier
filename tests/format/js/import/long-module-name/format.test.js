runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["import-defer.js", "import-source.js"],
    espree: ["import-defer.js", "import-source.js"],
    meriyah: ["import-defer.js", "import-source.js"],
    flow: ["import-defer.js", "import-source.js"],
    hermes: ["import-defer.js", "import-source.js"],
  },
});
