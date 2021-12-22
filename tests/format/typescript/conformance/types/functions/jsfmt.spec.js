run_spec(__dirname, ["typescript"], {
  errors: { "babel-ts": ["functionOverloadErrorsSyntax.ts"] },
});
