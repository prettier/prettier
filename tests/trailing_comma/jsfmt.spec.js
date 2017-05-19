run_spec(__dirname, null, ["typescript"]);
run_spec(__dirname, { trailingComma: "all" }, ["typescript"]);
run_spec(__dirname, { trailingComma: "es5" }, ["typescript"]);
run_spec(__dirname, { trailingComma: "array,import" }, ["typescript"]);
run_spec(__dirname, { trailingComma: "object,export,arguments" }, ["typescript"]);
