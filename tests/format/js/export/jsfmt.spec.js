const errors = {
  acorn: ["undefined.js"],
  espree: ["undefined.js"],
};

runFormatTest(import.meta, ["babel", "flow", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors,
  bracketSpacing: false,
});
