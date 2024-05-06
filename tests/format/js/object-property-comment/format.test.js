runFormatTest(import.meta, ["babel", "flow"], {
  errors: { acorn: ["comment.js"], espree: ["comment.js"] },
});
