const errors = { "babel-ts": ["jsdoc_only_types.ts", "index-signature.ts"] };
run_spec(__dirname, ["typescript"], { errors });
run_spec(__dirname, ["typescript"], { trailingComma: "es5", errors });
run_spec(__dirname, ["typescript"], { trailingComma: "all", errors });
