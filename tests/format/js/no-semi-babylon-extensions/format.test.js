runFormatTest(import.meta, ["babel"], {
  errors: { acorn: true, espree: true, meriyah: true, oxc: true },
});
runFormatTest(import.meta, ["babel"], {
  semi: false,
  errors: { acorn: true, espree: true, meriyah: true, oxc: true },
});
