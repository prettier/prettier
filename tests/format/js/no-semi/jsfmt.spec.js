const errors = { espree: ["class.js", "private-field.js"] };

// [prettierx] test with all ES parsers
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], { errors });
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  semi: false,
  errors,
});
