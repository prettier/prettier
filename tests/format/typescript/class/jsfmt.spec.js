run_spec(__dirname, ["typescript"], {
  errors: { "babel-ts": ["constructor.ts", "generics.ts", "methods.ts"] },
});
