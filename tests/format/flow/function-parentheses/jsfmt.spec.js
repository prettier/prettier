// [prettierx] test with babel-flow
// [TBD] skip TypeScript for now
// (known parse error with babel-ts parser)
run_spec(__dirname, ["flow", "babel", "babel-flow"]);
run_spec(__dirname, ["flow", "babel", "babel-flow"], { trailingComma: "all" });
run_spec(__dirname, ["flow", "babel", "babel-flow"], { arrowParens: "avoid" });
