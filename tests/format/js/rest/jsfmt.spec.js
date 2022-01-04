run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  errors: { espree: true, meriyah: true },
});
