// [prettierx] test with all Babel parsers
// [TBD] Skip flow & typescript for now due to differences in the snapshot)
run_spec(__dirname, ["babel", "babel-flow", "babel-ts"]);
