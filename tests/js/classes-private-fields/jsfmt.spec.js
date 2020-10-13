run_spec(__dirname, ["babel"], {
  errors: { espree: true, meriyah: ["optional-chaining.js"] },
});
run_spec(__dirname, ["babel"], {
  semi: false,
  errors: { espree: true, meriyah: ["optional-chaining.js"] },
});
