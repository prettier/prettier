run_spec(import.meta, ["flow", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: false,
});
run_spec(import.meta, ["flow", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: true,
});
run_spec(import.meta, ["flow", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: false,
});
run_spec(import.meta, ["flow", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: true,
});
