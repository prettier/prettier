// [prettierx] test with all Babel parsers
// (babel-ts is normally included with typescript by default)
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"]);
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  tabWidth: 4,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  useTabs: true,
});
run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  useTabs: true,
  tabWidth: 4,
});
