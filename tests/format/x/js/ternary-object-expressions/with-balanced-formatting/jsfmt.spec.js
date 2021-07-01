// [prettierx] test script notice:
// This test script runs for test files in parent directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/..`;

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  bogus1: true, // improve consistency of snapshot with prettierX 0.18.x
  // [prettierx] balanced ternary formatting option,
  // for consistency with "Standard JS":
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  bogus2: true, // improve consistency of snapshot with prettierX 0.18.x
  // variation from ../jsfmt.spec.js:
  tabWidth: 4,
  // [prettierx] balanced ternary formatting option,
  // for consistency with "Standard JS":
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  bogus3: true, // improve consistency of snapshot with prettierX 0.18.x
  // variation from ../jsfmt.spec.js:
  useTabs: true,
  // [prettierx] balanced ternary formatting option,
  // for consistency with "Standard JS":
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "typescript"], {
  // variation from ../jsfmt.spec.js:
  useTabs: true,
  tabWidth: 4,
  // [prettierx] balanced ternary formatting option,
  // for consistency with "Standard JS":
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});
