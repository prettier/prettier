run_spec(import.meta, ["babel", "flow", "typescript"], {
  errors: { flow: ["expr_and_same_line_comments.js"] },
});
