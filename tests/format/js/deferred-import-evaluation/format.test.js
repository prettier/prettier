const importDeferTests = [
  "import-defer.js",
  "import-defer-attributes-declaration.js",
  "dynamic-import.js",
  "dynamic-import-attributes-expression.js",
];

runFormatTest(import.meta, ["babel", "typescript"], {
  errors: {
    acorn: importDeferTests,
    espree: importDeferTests,
    meriyah: importDeferTests,
  },
});
