runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["assertions.js", "template-literal.js", "import-phase.js"],
    acorn: ["assertions.js", "import-phase.js"],
    espree: ["assertions.js", "import-phase.js"],
    meriyah: ["assertions.js", "import-phase.js"],
  },
});
