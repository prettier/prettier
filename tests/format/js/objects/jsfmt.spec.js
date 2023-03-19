const errors = {
  acorn: ["expression.js"],
  espree: ["expression.js"],
  typescript: ["expression.js", "bigint-key.js"],
  meriyah: ["expression.js"],
  flow: ["expression.js"],
};

run_spec(import.meta, ["babel", "typescript", "flow"], { errors });
run_spec(import.meta, ["babel", "typescript", "flow"], {
  experimentalOperatorPosition: true,
  errors,
});
