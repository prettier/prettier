const errors = {
  meriyah: ["optional-chaining.js"],
  espree: ["optional-chaining.js"],
};
run_spec(__dirname, ["babel"], {
  errors,
});
run_spec(__dirname, ["babel"], {
  semi: false,
  errors,
});
