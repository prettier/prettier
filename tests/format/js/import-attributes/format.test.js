const errors = {
  acorn: [
    "dynamic-import.js",
    "empty.js",
    "multi-types.js",
    "static-import.js",
    "re-export.js",
    "without-from.js",
    "non-type.js",
    "keyword-detect.js",
    "long-sources.js",
  ],
  espree: [
    "dynamic-import.js",
    "empty.js",
    "multi-types.js",
    "static-import.js",
    "re-export.js",
    "without-from.js",
    "non-type.js",
    "keyword-detect.js",
    "long-sources.js",
  ],
  meriyah: [
    "multi-types.js",
    "re-export.js",
    "without-from.js",
    "keyword-detect.js",
  ],
};
runFormatTest(import.meta, ["babel", "typescript"], { errors });
