runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["decorator.js", "class-expression-decorator.js"],
    espree: ["decorator.js", "class-expression-decorator.js"],
    flow: ["class-expression-decorator.js"],
  },
});
