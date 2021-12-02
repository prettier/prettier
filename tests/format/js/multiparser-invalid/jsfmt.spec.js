run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: { espree: true, flow: true, typescript: true, meriyah: true },
});
