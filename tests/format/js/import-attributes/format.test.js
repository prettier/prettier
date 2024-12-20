const errors = {
  acorn: ["multi-types.js"],
  espree: ["multi-types.js"],
  meriyah: ["multi-types.js", "without-from.js", "keyword-detect.js"],
};
runFormatTest(import.meta, ["babel", "typescript"], { errors });
