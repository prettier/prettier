run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  indentChains: false,
  // recommended:
  arrowParens: "avoid"
});

run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  indentChains: false,
  parenSpacing: true,
  // recommended:
  arrowParens: "avoid"
});
