run_spec(__dirname, ["flow", "babel", "babel-flow"]);
run_spec(__dirname, ["flow", "babel", "babel-flow"], { trailingComma: "all" });
run_spec(__dirname, ["flow", "babel", "babel-flow"], { arrowParens: "avoid" });
