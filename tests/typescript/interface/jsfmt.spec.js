run_spec(__dirname, ["typescript"], {
  errors: { "babel-ts": ["abstract.ts"] },
});
run_spec(__dirname, ["typescript"], {
  semi: false,
  errors: { "babel-ts": ["abstract.ts"] },
});
