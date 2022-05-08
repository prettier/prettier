run_spec(import.meta, ["babel", "flow"], {
  errors: { acorn: ["comment.js"], espree: ["comment.js"] },
});
