const errors = {
  flow: true,
  acorn: true,
  espree: true,
};

run_spec(__dirname, ["babel", "flow", "typescript"], { errors });
run_spec(__dirname, ["babel", "flow", "typescript"], { semi: false, errors });
