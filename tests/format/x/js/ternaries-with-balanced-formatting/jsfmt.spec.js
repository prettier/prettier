// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/ternaries`;

// using __typescript_estree to skip babel-ts below as needed
// with FULL_TEST=true due to this issue:
// https://github.com/babel/babel/issues/11959

run_spec(dirPath, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  // [prettierx] balanced ternary formatting option
  // (with improved consistency with "Standard JS"):
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  // variation from ../jsfmt.spec.js:
  tabWidth: 4,
  // [prettierx] balanced ternary formatting option
  // (with improved consistency with "Standard JS"):
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  // variation from ../jsfmt.spec.js:
  useTabs: true,
  // [prettierx] balanced ternary formatting option
  // (with improved consistency with "Standard JS"):
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});

run_spec(dirPath, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  // variation from ../jsfmt.spec.js:
  useTabs: true,
  tabWidth: 4,
  // [prettierx] balanced ternary formatting option
  // (with improved consistency with "Standard JS"):
  offsetTernaryExpressions: true,
  // [prettierx] more options needed for consistency with "Standard JS":
  arrowParens: "avoid",
  trailingComma: "none",
});
