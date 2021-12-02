const errors = {
  meriyah: ["optional-chaining.js"],
  espree: ["optional-chaining.js"],
};
run_spec(import.meta, ["babel"], {
  errors,
});
run_spec(import.meta, ["babel"], {
  semi: false,
  errors,
});
