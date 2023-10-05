const importDeferTests = [
  "import-defer.js",
  "import-defer-attributes-declaration.js",
];
const invalidSyntaxTests = ["no-default.js", "no-named.js"];

run_spec(import.meta, ["babel"], {
  errors: {
    acorn: [...importDeferTests, ...invalidSyntaxTests],
    espree: [...importDeferTests, ...invalidSyntaxTests],
    meriyah: [...importDeferTests, ...invalidSyntaxTests],
    babel: invalidSyntaxTests,
    __babel_estree: invalidSyntaxTests,
  },
});
