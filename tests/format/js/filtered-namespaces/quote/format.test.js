const errors = {
  acorn: true,
  espree: true,
  meriyah: true,
  flow: true,
  hermes: true,
  typescript: true,
  oxc: true,
  "oxc-ts": true,
  yuku: true,
  "yuku-ts": true,
};
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors,
  singleQuote: true,
});
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors,
  singleQuote: false,
});
