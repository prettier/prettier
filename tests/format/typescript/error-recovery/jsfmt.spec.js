const errors = { "babel-ts": ["jsdoc_only_types.ts", "index-signature.ts"] };
run_spec(import.meta, ["typescript"], { errors });
run_spec(import.meta, ["typescript"], { trailingComma: "es5", errors });
run_spec(import.meta, ["typescript"], { trailingComma: "all", errors });
