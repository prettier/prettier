const errors = {
  acorn: ["optional-chaining.js"],
  espree: ["optional-chaining.js"],
  meriyah: ["optional-chaining.js"],
};
runFormatTest(import.meta, ["babel"], {
  errors,
});
runFormatTest(import.meta, ["babel"], {
  semi: false,
  errors,
});
