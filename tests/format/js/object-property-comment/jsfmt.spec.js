run_spec(import.meta, ["babel", "flow"], {
  errors: { espree: ["comment.js"] },
});
