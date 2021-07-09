// [prettierx] test with all Babel parsers
// (babel-ts is normally included with typescript by default)
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  // [prettierx merge update from prettier@2.3.x] GONE:
  // errors: ...
});
