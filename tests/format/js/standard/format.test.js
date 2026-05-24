runFormatTest(import.meta, ["babel", "flow", "typescript"], {
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
