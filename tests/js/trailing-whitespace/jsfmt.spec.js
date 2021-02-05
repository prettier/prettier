run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: true, meriyah: true },
});
