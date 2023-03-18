run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: ["undefined.js"] },
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  bracketSpacing: false,
  errors: { espree: ["undefined.js"] },
});
