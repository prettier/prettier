run_spec(import.meta, ["flow", "babel", "typescript"], {
  bracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
  },
});
