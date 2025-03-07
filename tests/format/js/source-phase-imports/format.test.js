const importSourceTests = [
  "import-source-attributes-declaration.js",
  "import-source-attributes-expression.js",
  "import-source-binding-from.js",
  "import-source-binding-source.js",
  "import-source-dynamic-import.js",
  "import-source.js",
];
const invalidSyntaxTests = ["no-namespace.js", "no-named.js"];

runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: [...importSourceTests, ...invalidSyntaxTests],
    espree: [...importSourceTests, ...invalidSyntaxTests],
    meriyah: [...importSourceTests, ...invalidSyntaxTests],
    babel: invalidSyntaxTests,
    __babel_estree: invalidSyntaxTests,
  },
});
