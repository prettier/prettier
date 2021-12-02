run_spec(import.meta, ["babel"], { errors: { espree: true, meriyah: true } });
run_spec(import.meta, ["babel"], {
  semi: false,
  errors: { espree: true, meriyah: true },
});
