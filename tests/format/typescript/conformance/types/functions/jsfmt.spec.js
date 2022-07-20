run_spec(import.meta, ["typescript"], {
  errors: { "babel-ts": ["functionOverloadErrorsSyntax.ts"] },
});
run_spec(import.meta, ["typescript"], {
  trailingComma: "es5",
  errors: {
    "babel-ts": ["functionOverloadErrorsSyntax.ts"],
  },
});
