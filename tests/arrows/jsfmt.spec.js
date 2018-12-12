for (const jsxBracketSpacing of [false, true]) {
  for (const arrowParens of ["avoid", "always"]) {
    run_spec(__dirname, ["babylon", "typescript"], {
      arrowParens,
      jsxBracketSpacing
    });
  }
}
