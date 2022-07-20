run_spec(import.meta, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
run_spec(import.meta, ["babel"], {
  trailingComma: "es5",
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
  },
});
