const errors = {
  espree: ["optional-chaining.js"],
};
runFormatTest(import.meta, ["babel"], {
  errors,
});
runFormatTest(import.meta, ["babel"], {
  semi: false,
  errors,
});
