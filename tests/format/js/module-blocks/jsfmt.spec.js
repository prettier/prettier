run_spec(import.meta, ["babel"], {
  errors: {
    espree: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
    meriyah: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
  },
});
