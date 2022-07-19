run_spec(__dirname, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
run_spec(__dirname, ["babel"], {
  semi: false,
  errors: { acorn: true, espree: true, meriyah: true },
});
