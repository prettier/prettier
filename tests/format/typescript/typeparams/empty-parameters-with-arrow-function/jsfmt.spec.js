run_spec(
  __dirname,
  ["typescript", "flow", "babel-flow"],
  // #13817 require those options to reproduce
  { arrowParens: "avoid", trailingComma: "all" }
);
