// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

// [FUTURE TBD] use Nodejs path function (...)
const dirPath = `${__dirname}/../../../js/ternaries`;

// using __typescript_estree to skip babel-ts below as needed
// with FULL_TEST=true due to this issue:
// https://github.com/babel/babel/issues/11959

run_spec(dirPath, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  spaceInParens: true,
  arrayBracketSpacing: true,
  computedPropertySpacing: true,
  spaceUnaryOps: true,
  templateCurlySpacing: true,
  // [prettierx] recommended option:
  arrowParens: "avoid",
  // [prettierx] "Standard JS" setting:
  trailingComma: "none",
});
