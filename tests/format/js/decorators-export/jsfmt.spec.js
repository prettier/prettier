// TypeScript and Flow don't accept decorator after export
run_spec(__dirname, ["babel"], {
  errors: { espree: true, meriyah: ["after_export.js"] },
});
