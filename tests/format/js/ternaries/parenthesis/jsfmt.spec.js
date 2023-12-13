const parsers = [
  // Didn't test flow and typescript since they can't parse `await (a ? b : c)` correctly
  "babel", // "flow", "typescript"
];

run_spec(import.meta, parsers);
run_spec(import.meta, parsers, { experimentalTernaries: true });
