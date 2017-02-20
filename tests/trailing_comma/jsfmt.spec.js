run_spec(__dirname);
run_spec(__dirname, { trailingComma: "all" });
run_spec(__dirname, { trailingComma: "es5" });
run_spec(__dirname, { trailingComma: "array,import" });
run_spec(__dirname, { trailingComma: "object,export,arguments" });
