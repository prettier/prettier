run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: true, flow: true, typescript: true, meriyah: true },
});
