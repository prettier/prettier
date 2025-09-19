const unsupportedParsers = ["import-defer.js", "import-source.js"];

const errors = {
  acorn: unsupportedParsers,
  espree: unsupportedParsers,
  meriyah: unsupportedParsers,
  hermes: unsupportedParsers,
};

runFormatTest(import.meta, ["babel"], { errors });
runFormatTest(import.meta, ["babel"], {
  errors,
  bracketSpacing: false,
});
