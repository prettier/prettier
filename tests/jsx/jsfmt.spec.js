for (const jsxBracketSpacing of [false, true]) {
  for (const singleQuote of [false, true]) {
    for (const jsxSingleQuote of [false, true]) {
      run_spec(__dirname, ["flow", "babylon", "typescript"], {
        singleQuote,
        jsxSingleQuote,
        jsxBracketSpacing
      });
    }
  }
}
