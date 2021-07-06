// [prettierx] test with all Babel parsers
// (babel-ts is normally included with typescript by default)
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"]);
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx]: broken-out bracket spacing options
  exportCurlySpacing: false,
});
