const errors = {
  acorn: ["multi-types.js"],
  espree: ["multi-types.js"],
  meriyah: ["multi-types.js"],
  oxc: ["multi-types.js"],
  "oxc-ts": ["multi-types.js"],
};
runFormatTest(import.meta, ["babel", "typescript"], { errors });
