const errors = {
  flow: true,
  hermes: true,
  acorn: true,
  espree: true,
};

runFormatTest(import.meta, ["babel", "flow", "typescript"], { errors });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  semi: false,
  errors,
});
