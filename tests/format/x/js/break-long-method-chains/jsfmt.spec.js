run_spec(__dirname, ["babel", "babel-flow", "typescript"]);
run_spec(__dirname, ["babel", "babel-flow", "typescript"], {
  breakLongMethodChains: true,
});
