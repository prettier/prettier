const fixtures = {
  importMeta: import.meta,
  snippets: ["- a `x/  \n      y` z\n", "> - [x] a `x/  \n>           y` z\n"],
};

for (const proseWrap of ["preserve", "always", "never"]) {
  runFormatTest(fixtures, ["markdown"], { proseWrap });
}
