const errors = {
  acorn: true,
  espree: true,
  meriyah: true,
  oxc: true,
  "oxc-ts": true,
};
runFormatTest(import.meta, ["babel"], { errors });
runFormatTest(import.meta, ["babel"], { semi: false, errors });
