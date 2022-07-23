run_spec(import.meta, ["babel", "flow"], {
  trailingComma: "all",
  errors: { acorn: true, espree: true, meriyah: true },
});
