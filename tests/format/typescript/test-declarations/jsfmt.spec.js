run_spec(__dirname, ["typescript", "babel", "flow"]);
run_spec(__dirname, ["typescript", "babel", "flow"], {
  arrowParens: "avoid",
});
