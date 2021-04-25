run_spec(__dirname, ["yaml"]);
run_spec(__dirname, ["yaml"], { trailingComma: "none" });
run_spec(__dirname, ["yaml"], { trailingComma: "es5" });
run_spec(__dirname, ["yaml"], { trailingComma: "all" });
