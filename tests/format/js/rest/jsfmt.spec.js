run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "all",
  errors: { acorn: true, espree: true, meriyah: true },
});
