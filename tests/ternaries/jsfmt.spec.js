for (const jsxBracketSpacing of [false, true]) {
  for (const useTabs of [undefined, true]) {
    for (const tabWidth of [undefined, 4]) {
      run_spec(__dirname, ["flow", "typescript"], {
        useTabs,
        tabWidth,
        jsxBracketSpacing
      });
    }
  }
}
