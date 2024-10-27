// using __typescript_estree to skip babel-ts below,
// as needed with FULL_TEST=true due to this issue:
// https://github.com/babel/babel/issues/11959
run_spec(__dirname, ["babel", "babel-flow", "flow", "__typescript_estree"], {
  // explicit endOfLine setting, same as default since Prettier 2.0
  // (shows <LF> in test snapshots)
  endOfLine: "lf",
  // "Standard JS":
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  offsetTernaryExpressions: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: "none",
  // recommended:
  arrowParens: "avoid",
});
