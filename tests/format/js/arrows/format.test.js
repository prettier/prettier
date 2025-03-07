const errors = {
  acorn: ["tuple-and-record.js"],
  espree: ["tuple-and-record.js"],
  meriyah: ["tuple-and-record.js"],
  typescript: ["tuple-and-record.js"],
  flow: ["tuple-and-record.js"],
};
runFormatTest(import.meta, ["babel", "typescript"], {
  arrowParens: "always",
  errors,
});
runFormatTest(import.meta, ["babel", "typescript"], {
  arrowParens: "avoid",
  errors,
});
