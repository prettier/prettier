run_spec(__dirname, ["babel"], {
  semi: false,
  errors: { espree: true, meriyah: true },
});
