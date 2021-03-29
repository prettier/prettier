run_spec(__dirname, ["babel"], {
  errors: {
    espree: ["module-blocks.js", "range.js", "comments.js"],
    meriyah: ["module-blocks.js", "range.js", "comments.js"],
  },
});
