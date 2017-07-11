run_spec(__dirname, { jsxBracketSameLine: true }, [
  "typescript",
  "typescriptBabylon"
]);
run_spec(__dirname, { jsxBracketSameLine: false }, ["typescript"]);
