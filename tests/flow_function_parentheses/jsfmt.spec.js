run_spec(__dirname, ["flow", "babylon"]);
run_spec(__dirname, ["flow", "babylon"], { trailingComma: "all" });
run_spec(__dirname, ["flow", "babylon"], { arrowParens: "always" });
