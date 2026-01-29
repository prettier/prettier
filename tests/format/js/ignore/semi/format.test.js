const errors = {
  acorn: ["class-expression-decorator.js"],
  espree: ["class-expression-decorator.js"],
  flow: ["class-expression-decorator.js"],
  hermes: ["class-expression-decorator.js"],
};

runFormatTest(import.meta, ["babel", "flow", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  semi: false,
  errors,
});
