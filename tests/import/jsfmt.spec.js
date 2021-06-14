// [prettierx] test with muliple Babel parsers:
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"]);
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  importCurlySpacing: false,
});
