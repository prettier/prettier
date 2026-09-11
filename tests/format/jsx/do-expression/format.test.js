runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: {
    acorn: ["do-expression.js"],
    espree: ["do-expression.js"],
    meriyah: ["do-expression.js"],
    oxc: ["do-expression.js"],
    "oxc-ts": ["do-expression.js"],
    yuku: ["do-expression.js"],
    "yuku-ts": ["do-expression.js"],
    typescript: ["do-expression.js"],
    flow: ["do-expression.js"],
    hermes: ["do-expression.js"],
  },
});
