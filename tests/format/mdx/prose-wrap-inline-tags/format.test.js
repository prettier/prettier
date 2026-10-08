for (const proseWrap of ["always", "preserve", "never"]) {
  runFormatTest(import.meta, ["mdx"], { proseWrap });
}
