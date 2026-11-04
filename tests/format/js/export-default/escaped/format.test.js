const exportDefaultFromTests = ["export-1.js", "export-2.js", "export-3.js"];

runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: exportDefaultFromTests,
    espree: exportDefaultFromTests,
    meriyah: exportDefaultFromTests,
    flow: exportDefaultFromTests,
    hermes: exportDefaultFromTests,
    typescript: exportDefaultFromTests,
    oxc: exportDefaultFromTests,
    "oxc-ts": exportDefaultFromTests,
    yuku: exportDefaultFromTests,
    "yuku-ts": exportDefaultFromTests,
  },
});
