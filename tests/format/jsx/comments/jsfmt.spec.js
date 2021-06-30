run_spec(__dirname, ["flow", "babel", "typescript"], {
  jsxBracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
    // [prettierx] test error(s) with __typescript_estree parser option
    __typescript_estree: ["in-end-tag.js"],
  },
});
