run_spec(__dirname, ["typescript"], {
  errors: {
    "babel-ts": ["readonlyInConstructorParameters.ts", "readonlyReadonly.ts"],
  },
});
