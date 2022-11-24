run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
