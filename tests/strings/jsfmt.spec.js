for (const jsxBracketSpacing of [false, true]) {
  for (const trailingComma of [undefined, "all"]) {
    run_spec(__dirname, ["flow"], { trailingComma, jsxBracketSpacing });
  }
}
