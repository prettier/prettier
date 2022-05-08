const errors = {
  acorn: ["optional-chaining.js"],
  espree: ["optional-chaining.js"],
  meriyah: ["optional-chaining.js"],
};
run_spec(import.meta, ["babel"], {
  errors,
});
run_spec(import.meta, ["babel"], {
  semi: false,
  errors,
});
