const errors = {
  flow: ["static.js"],
};

run_spec(import.meta, ["babel", "flow", "typescript"], { errors });
run_spec(import.meta, ["babel", "flow", "typescript"], { errors, semi: false });
