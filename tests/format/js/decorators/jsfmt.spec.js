run_spec(__dirname, ["babel"], {
  errors: { espree: true, meriyah: ["multiple.js", "mobx.js"] },
});
