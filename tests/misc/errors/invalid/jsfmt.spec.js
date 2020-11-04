for (const parser of [
  "babel",
  "flow",
  "typescript",
  "babel-flow",
  "babel-ts",
  "espree",
]) {
  run_spec(
    {
      dirname: __dirname,
      snippets: ["for each (a in b) {}"],
    },
    [parser]
  );
}
