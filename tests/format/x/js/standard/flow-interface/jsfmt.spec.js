run_spec(__dirname, ["babel", "babel-flow", "flow"], {
  // "Standard JS":
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: "none",
});

/* using prettierx with typescript parser seems to omit a semicolon
 * which is added when using babel, babel-flow, or flow parser
 * in a case like this:
 interface Foo<T> {
-  getter(value: T): T;
+  getter(value: T): T
 }
 * */
run_spec(__dirname, ["typescript"], {
  yieldStarSpacing: true,
  generatorStarSpacing: true,
  spaceBeforeFunctionParen: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
});
