for (const jsxBracketSpacing of [false, true]) {
  for (const semi of [undefined, false]) {
    run_spec(__dirname, ["mdx"], { semi, jsxBracketSpacing });
  }
}
