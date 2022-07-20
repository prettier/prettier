run_spec(import.meta, ["babel"], {
  errors: {
    acorn: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
    espree: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
    meriyah: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
  },
});
run_spec(import.meta, ["babel"], {
  trailingComma: "es5",
  errors: {
    acorn: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
    espree: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
    meriyah: ["module-blocks.js", "range.js", "comments.js", "worker.js"],
  },
});
