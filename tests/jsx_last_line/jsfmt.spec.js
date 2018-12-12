for (const jsxBracketSpacing of [false, true]) {
  for (const jsxBracketSameLine of [true, false]) {
    run_spec(__dirname, ["flow", "typescript"], {
      jsxBracketSameLine,
      jsxBracketSpacing
    });
  }
}
