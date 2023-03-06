run_spec(__dirname, ["typescript", "flow"], {
  errors: { typescript: ["typeof-2.ts"], "babel-ts": ["typeof-2.ts"] },
});
