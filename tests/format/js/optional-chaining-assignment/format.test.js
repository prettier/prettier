const invalidSyntaxTests = [
  "invalid-destructuring-arr.js",
  "invalid-destructuring-obj.js",
  "invalid-fn-param-arrow.js",
  "invalid-fn-param.js",
  "invalid-fn-param-assign.js",
  "invalid-for-await-of.js",
  "invalid-for-in.js",
  "invalid-for-of.js",
  "invalid-inc-postfix.js",
  "invalid-inc-prefix.js",
];

const optionalChainingAssignTests = [
  "valid-lhs-eq.js",
  "valid-lhs-plus-eq.js",
  "valid-parenthesized.js",
  "valid-complex-case.js",
];

// meriyah can parse these files
const meriyahCanParse = new Set(["valid-lhs-eq.js", "valid-lhs-plus-eq.js"]);

runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: [...optionalChainingAssignTests, ...invalidSyntaxTests],
    espree: [...optionalChainingAssignTests, ...invalidSyntaxTests],
    meriyah: [
      ...optionalChainingAssignTests.filter(
        (test) => !meriyahCanParse.has(test),
      ),
      ...invalidSyntaxTests,
    ],
    babel: invalidSyntaxTests,
    __babel_estree: invalidSyntaxTests,
  },
});
