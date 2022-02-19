run_spec(__dirname, ["babel", "babel-flow", "babel-ts"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
