run_spec(__dirname, ["babel"], {
  errors: {
    babel: ["invalid-tuple-holes.js"],
    espree: true,
    meriyah: true,
  },
});
