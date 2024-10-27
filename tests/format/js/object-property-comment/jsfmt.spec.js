run_spec(__dirname, ["babel", "flow"], {
  errors: { espree: ["comment.js"] },
});
