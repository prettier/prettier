for (const quoteProps of ["as-needed", "preserve", "consistent"]) {
  runFormatTest(import.meta, ["typescript"], { semi: false, quoteProps });
}
