// [prettierx] test with Flow & all Babel parsers
// (babel-ts is normally included with typescript by default)
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  arrowParens: "always",
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  arrowParens: "avoid",
});
