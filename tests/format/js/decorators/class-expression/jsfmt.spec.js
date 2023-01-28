const errors = {
  flow: true,
  typescript: true,
  acorn: true,
  espree: true,
};

run_spec(import.meta, ["babel", "flow", "typescript"], { errors });
run_spec(import.meta, ["babel", "flow", "typescript"], { semi: false, errors });
