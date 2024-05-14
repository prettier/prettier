runFormatTest(import.meta, ["babel", "babel-flow", "babel-ts"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
