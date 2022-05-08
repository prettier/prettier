run_spec(import.meta, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: ["multiple.js", "mobx.js"] },
});
