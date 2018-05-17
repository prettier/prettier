run_spec(__dirname, ["flow", "typescript"]);
run_spec(__dirname, ["flow", "typescript"], { jsxMaxPropsPerLine: 1 });
run_spec(__dirname, ["flow", "typescript"], { jsxMaxPropsPerLine: 2 });
