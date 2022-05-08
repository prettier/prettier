// TypeScript and Flow don't accept decorator after export
run_spec(import.meta, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: ["after_export.js"] },
});
