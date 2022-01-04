const parser = ["babel", "flow", "typescript"];

run_spec(import.meta, parser /*, { trailingComma: "es5" }*/);
run_spec(import.meta, parser, { trailingComma: "none" });
run_spec(import.meta, parser, { trailingComma: "all" });
