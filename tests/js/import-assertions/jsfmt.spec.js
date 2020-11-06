run_spec(__dirname, ["babel"], {
  errors: {
    espree: [
      "import-assertions-dynamic.js",
      "import-assertions-multi-types.js",
      "import-assertions-static.js",
      "import-assertions-without-from.js",
      "import-assertions-for-export.js",
    ],
    meriyah: [
      "import-assertions-dynamic.js",
      "import-assertions-multi-types.js",
      "import-assertions-static.js",
      "import-assertions-without-from.js",
      "import-assertions-for-export.js",
    ],
  },
});
