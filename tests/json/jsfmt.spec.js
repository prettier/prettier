run_spec(__dirname, ["json"]);
run_spec(__dirname, ["json"], { trailingComma: "all" });
run_spec(__dirname, ["json"], { jsonKeepNumericLiteral: true });
run_spec(__dirname, ["json5"]);
run_spec(__dirname, ["json5"], { trailingComma: "all" });
run_spec(__dirname, ["json5"], { jsonKeepNumericLiteral: true });
run_spec(__dirname, ["json-stringify"]);
run_spec(__dirname, ["json-stringify"], { jsonKeepNumericLiteral: true });
