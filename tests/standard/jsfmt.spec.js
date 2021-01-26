run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  // [TBD] issue with babel-ts parser:
  disableBabelTS: ["incorrect-ternaries.js"],
  // explicit endOfLine setting, same as default since Prettier 2.0
  // (shows <LF> in test snapshots)
  endOfLine: "lf",
  // "Standard JS":
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  alignTernaryLines: false,
  trailingComma: "none",
  // recommended:
  arrowParens: "avoid",
});
