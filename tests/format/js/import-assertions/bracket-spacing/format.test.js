runFormatTest(import.meta, ["babel"], {
  bracketSpacing: false,
  errors: {
    acorn: ["static-import.js", "re-export.js", "empty.js"],
    espree: ["static-import.js", "re-export.js", "empty.js"],
    meriyah: ["static-import.js", "re-export.js", "empty.js"],
  },
});
