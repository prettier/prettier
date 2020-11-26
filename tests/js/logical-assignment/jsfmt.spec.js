run_spec(__dirname, ["babel", "typescript"], {
  errors: { espree: ["invalid.js"], meriyah: true },
});
