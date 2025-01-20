const importDeferTests = [
  "import-defer.js",
  "import-defer-attributes-declaration.js",
  "dynamic-import.js",
  "dynamic-import-attributes-expression.js",
];
const invalidSyntaxTests = ["no-default.js", "no-named.js"];

runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: [...importDeferTests, ...invalidSyntaxTests],
    espree: [...importDeferTests, ...invalidSyntaxTests],
    meriyah: [...importDeferTests, ...invalidSyntaxTests],
    babel: invalidSyntaxTests,
    __babel_estree: invalidSyntaxTests,
  },
});
