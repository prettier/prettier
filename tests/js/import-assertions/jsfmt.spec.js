run_spec(__dirname, ["babel"], {
  errors: {
    espree: [
      "import-assertions-dynamic.js",
      "import-assertions-multi-types.js",
      "import-assertions-static.js",
    ],
    meriyah: [
      "import-assertions-dynamic.js",
      "import-assertions-multi-types.js",
      "import-assertions-static.js",
    ],
  },
});
