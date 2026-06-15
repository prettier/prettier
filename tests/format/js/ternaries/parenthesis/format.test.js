const parsers = [
  // Didn't test flow and typescript since they can't parse `await (a ? b : c)` correctly
  "babel", // "flow", "typescript"
];

runFormatTest(import.meta, parsers);
runFormatTest(import.meta, parsers, { experimentalTernaries: true });
