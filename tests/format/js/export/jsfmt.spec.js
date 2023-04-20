const errors = {
  acorn: ["undefined.js"],
  espree: ["undefined.js"],
};

run_spec(import.meta, ["babel", "flow", "typescript"], { errors });
run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors,
  bracketSpacing: false,
});
