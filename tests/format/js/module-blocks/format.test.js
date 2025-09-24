const errors = {
  acorn: ["module-blocks.js", "range.js", "comments.js"],
  espree: ["module-blocks.js", "range.js", "comments.js"],
  meriyah: ["module-blocks.js", "range.js", "comments.js"],
  oxc: ["module-blocks.js", "range.js", "comments.js"],
  "oxc-ts": ["module-blocks.js", "range.js", "comments.js"],
};

runFormatTest(import.meta, ["babel"], { errors });
