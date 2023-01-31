const errors = {
  acorn: ["expression.js"],
  espree: ["expression.js"],
  meriyah: ["expression.js"],
}

run_spec(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: false,
  errors,
});
run_spec(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: false,
  jsxSingleQuote: true,
  errors,
});
run_spec(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: false,
  errors,
});
run_spec(import.meta, ["flow", "babel", "typescript"], {
  singleQuote: true,
  jsxSingleQuote: true,
  errors,
});
