// TypeScript and Flow don't accept decorator after export
runFormatTest(import.meta, ["babel"], {
  errors: { acorn: true, espree: true },
});
