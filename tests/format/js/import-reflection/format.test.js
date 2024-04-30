runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: [
      "comments.js",
      "import-reflection.js",
      "valid-default-import.mjs",
      "valid-from-as-default-module-binding-escaped.mjs",
      "valid-from-as-default-module-binding.mjs",
    ],
    typescript: [
      "comments.js",
      "import-reflection.js",
      "valid-default-import.mjs",
      "valid-from-as-default-module-binding-escaped.mjs",
      "valid-from-as-default-module-binding.mjs",
    ],
    acorn: [
      "comments.js",
      "import-reflection.js",
      "valid-default-import.mjs",
      "valid-from-as-default-module-binding-escaped.mjs",
      "valid-from-as-default-module-binding.mjs",
    ],
    espree: [
      "comments.js",
      "import-reflection.js",
      "valid-default-import.mjs",
      "valid-from-as-default-module-binding-escaped.mjs",
      "valid-from-as-default-module-binding.mjs",
    ],
    meriyah: [
      "comments.js",
      "import-reflection.js",
      "valid-default-import.mjs",
      "valid-from-as-default-module-binding-escaped.mjs",
      "valid-from-as-default-module-binding.mjs",
    ],
  },
});
