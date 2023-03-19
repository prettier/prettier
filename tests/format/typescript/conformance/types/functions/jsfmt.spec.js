run_spec(import.meta, ["typescript"], {
  errors: { "babel-ts": ["functionOverloadErrorsSyntax.ts"] },
});
run_spec(import.meta, ["typescript"], {
  experimentalOperatorPosition: true,
  errors: { "babel-ts": ["functionOverloadErrorsSyntax.ts"] },
});
