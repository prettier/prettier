for (const jsxBracketSpacing of [false, true]) {
  const jsxBracketSameLine = true;
  run_spec(__dirname, ["flow", "babylon", "typescript"], {
    jsxBracketSameLine,
    jsxBracketSpacing
  });
}
