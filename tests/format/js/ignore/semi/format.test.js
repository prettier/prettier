const errors = {
  acorn: ["decorator.js", "class-expression-decorator.js"],
  espree: ["decorator.js", "class-expression-decorator.js"],
  flow: ["class-expression-decorator.js"],
  hermes: ["decorator.js", "class-expression-decorator.js"],
};

runFormatTest(import.meta, ["babel", "flow", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  semi: false,
  errors,
});
