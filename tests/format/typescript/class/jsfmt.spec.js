run_spec(import.meta, ["typescript"], {
  errors: { "babel-ts": ["constructor.ts", "generics.ts", "methods.ts"] },
});
