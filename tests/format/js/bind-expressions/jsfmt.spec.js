run_spec(import.meta, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
run_spec(import.meta, ["babel"], {
  semi: false,
  errors: { acorn: true, espree: true, meriyah: true },
});
