const parsers = [
  // Didn't test flow and TypeScript since they can't parse `await (a ? b : c)` correctly
  "babel", // "flow", "typescript"
];

runFormatTest(import.meta, parsers);
runFormatTest(import.meta, parsers, { experimentalTernaries: true });
