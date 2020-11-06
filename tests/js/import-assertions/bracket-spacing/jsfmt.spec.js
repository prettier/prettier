run_spec(__dirname, ["babel"], {
  bracketSpacing: false,
  errors: {
    espree: [
      "import-assertions-dynamic.js",
      "import-assertions-static.js",
      "import-assertions-for-export.js",
    ],
    meriyah: [
      "import-assertions-dynamic.js",
      "import-assertions-static.js",
      "import-assertions-for-export.js",
    ],
  },
});
