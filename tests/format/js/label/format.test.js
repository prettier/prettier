runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["invalid-undefined-label.js"],
    acorn: ["invalid-undefined-label.js", "invalid-unsyntactic-continue.js"],
    espree: ["invalid-undefined-label.js", "invalid-unsyntactic-continue.js"],
    meriyah: ["invalid-undefined-label.js"],
    hermes: ["invalid-undefined-label.js", "invalid-unsyntactic-continue.js"],
  },
});
