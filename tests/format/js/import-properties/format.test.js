runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["import-defer.js", "import-source.js"],
    espree: ["import-defer.js", "import-source.js"],
    meriyah: ["import-defer.js", "import-source.js"],
    hermes: ["import-defer.js", "import-source.js"],
  },
});
