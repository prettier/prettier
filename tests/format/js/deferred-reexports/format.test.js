const deferredReexportsTests = [
  "comment-before-braces.js",
  "default-from-export-default-from.js",
  "export-defer.js",
  "named.js",
  "namespace.js",
];

runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: {
    acorn: deferredReexportsTests,
    espree: deferredReexportsTests,
    meriyah: deferredReexportsTests,
    flow: deferredReexportsTests,
    hermes: deferredReexportsTests,
    typescript: deferredReexportsTests,
    oxc: deferredReexportsTests,
    "oxc-ts": deferredReexportsTests,
    yuku: deferredReexportsTests,
    "yuku-ts": deferredReexportsTests,
  },
});
