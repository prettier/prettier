for (const jsxBracketSpacing of [false, true]) {
  for (const trailingComma of [undefined, "all", "es5"]) {
    run_spec(__dirname, ["flow", "typescript"], {
      trailingComma,
      jsxBracketSpacing
    });
  }
}
