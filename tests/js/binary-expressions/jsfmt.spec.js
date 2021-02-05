run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: { espree: ["like-regexp.js"] },
});
