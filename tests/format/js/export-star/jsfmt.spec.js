run_spec(__dirname, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["export-star-as-default.js", "export-star-as-string.js"],
    typescript: ["export-star-as-string.js"],
  },
});
