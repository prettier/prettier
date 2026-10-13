const errors = {
  acorn: ["class-expression-decorator.js", "asi-bind-expression.js"],
  espree: ["class-expression-decorator.js", "asi-bind-expression.js"],
  flow: ["class-expression-decorator.js", "asi-bind-expression.js"],
  typescript: ["asi-bind-expression.js"],
  meriyah: ["asi-bind-expression.js"],
  oxc: ["asi-bind-expression.js"],
  "oxc-ts": ["asi-bind-expression.js"],
  yuku: ["asi-bind-expression.js"],
  "yuku-ts": ["asi-bind-expression.js"],
  hermes: ["asi-bind-expression.js"],
};

runFormatTest(import.meta, ["babel", "flow", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  semi: false,
  errors,
});
