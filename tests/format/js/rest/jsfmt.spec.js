run_spec(__dirname, ["babel", "flow"], {
  trailingComma: "all",
  errors: { espree: true, meriyah: true },
});
