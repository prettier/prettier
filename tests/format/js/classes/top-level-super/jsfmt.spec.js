run_spec(__dirname, ["babel", "typescript"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
