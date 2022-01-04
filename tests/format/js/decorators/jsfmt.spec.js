run_spec(import.meta, ["babel"], {
  errors: { espree: true, meriyah: ["multiple.js", "mobx.js"] },
});
