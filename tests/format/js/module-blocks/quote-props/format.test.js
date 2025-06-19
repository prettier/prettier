runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["worker.js"],
    espree: ["worker.js"],
    meriyah: ["worker.js"],
    oxc: ["worker.js"],
    "oxc-ts": ["worker.js"],
  },
});
