// TypeScript and Flow don't accept decorator after export
run_spec(import.meta, ["babel"], {
  errors: { espree: true, meriyah: ["after_export.js"] },
});
