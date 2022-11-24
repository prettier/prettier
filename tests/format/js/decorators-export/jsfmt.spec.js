// TypeScript and Flow don't accept decorator after export
run_spec(__dirname, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: ["after_export.js"] },
});
