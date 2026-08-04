runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: ["child.js"],
    espree: ["child.js"],
  },
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  bracketSpacing: false,
  errors: {
    acorn: ["child.js"],
    espree: ["child.js"],
  },
});
