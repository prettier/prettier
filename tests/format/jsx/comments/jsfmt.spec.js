run_spec(__dirname, ["flow", "babel", "typescript"], {
  jsxBracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
  },
});
