run_spec(import.meta, ["babel", "flow"], {
  errors: { acorn: true, espree: true, meriyah: true, flow: true },
});
