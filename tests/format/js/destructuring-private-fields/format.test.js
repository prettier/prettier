runFormatTest(import.meta, ["babel", "babel-ts"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
