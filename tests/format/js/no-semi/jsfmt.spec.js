// [prettierx merge update from prettier@2.3.x ...]
const errors = {};

// [prettierx] test with all ES parsers
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], { errors });
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  semi: false,
  errors,
});
