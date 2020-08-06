run_spec(__dirname, ["babel", "babel-flow", "flow", "typescript"], {
  // [TBD] issue with babel-ts parser:
  disableBabelTS: ["incorrect-ternaries.js"],
  // "Standard JS":
  endOfLine: "lf",
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
