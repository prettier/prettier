run_spec(__dirname, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: ["multiple.js", "mobx.js"] },
});
