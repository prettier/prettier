run_spec(__dirname, ["babel", "flow"], {
  errors: { acorn: ["comment.js"], espree: ["comment.js"] },
});
