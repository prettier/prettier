const importDeferTests = [
  "import-defer.js",
  "import-defer-attributes-declaration.js",
  "dynamic-import.js",
  "dynamic-import-attributes-expression.js",
];
const invalidSyntaxTests = ["no-default.js", "no-named.js"];

runFormatTest(import.meta, ["babel", "typescript"], {
  errors: {
    acorn: [...importDeferTests, ...invalidSyntaxTests],
    espree: [...importDeferTests, ...invalidSyntaxTests],
    meriyah: [...importDeferTests, ...invalidSyntaxTests],
    oxc: invalidSyntaxTests,
    "oxc-ts": invalidSyntaxTests,
    babel: invalidSyntaxTests,
    "babel-ts": invalidSyntaxTests,
    __babel_estree: invalidSyntaxTests,
  },
});
