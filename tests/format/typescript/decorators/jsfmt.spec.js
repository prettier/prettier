run_spec(import.meta, ["typescript"], {
  errors: {
    typescript: ["abstract-method.ts", "accessor.ts"],
    "babel-ts": ["issue-9102.ts"],
  },
});
