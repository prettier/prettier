run_spec(import.meta, ["typescript"], {
  errors: { "babel-ts": ["constructor.ts", "generics.ts", "methods.ts"] },
});
run_spec(import.meta, ["typescript"], {
  trailingComma: "es5",
  errors: {
    "babel-ts": ["constructor.ts", "generics.ts", "methods.ts"],
  },
});
