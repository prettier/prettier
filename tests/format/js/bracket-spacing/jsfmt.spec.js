// [prettierx] test with all Babel parsers
// (babel-ts is normally included with typescript by default)
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"]);
// [prettierx]: broken-out bracket spacing options
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  objectCurlySpacing: false,
});
