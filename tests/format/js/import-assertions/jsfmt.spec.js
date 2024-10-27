run_spec(__dirname, ["babel"], {
  errors: {
    espree: [
      "dynamic-import.js",
      "empty.js",
      "multi-types.js",
      "static-import.js",
      "re-export.js",
      "without-from.js",
      "non-type.js",
    ],
    meriyah: [
      "dynamic-import.js",
      "empty.js",
      "multi-types.js",
      "static-import.js",
      "re-export.js",
      "without-from.js",
      "non-type.js",
    ],
  },
});
