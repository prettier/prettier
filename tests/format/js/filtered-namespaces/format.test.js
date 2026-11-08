const exportsFilterTests = [
  "namespace-export-filter.js",
  "namespace-import-filter.js",
  "dangling-comments.js",
];

runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: {
    acorn: exportsFilterTests,
    espree: exportsFilterTests,
    meriyah: exportsFilterTests,
    flow: [...exportsFilterTests, "import-expression.js"],
    hermes: [...exportsFilterTests, "import-expression.js"],
    typescript: exportsFilterTests,
    oxc: exportsFilterTests,
    "oxc-ts": exportsFilterTests,
    yuku: exportsFilterTests,
    "yuku-ts": exportsFilterTests,
  },
});
