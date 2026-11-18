for (const quoteProps of ["as-needed", "preserve", "consistent"]) {
  runFormatTest(import.meta, ["babel", "flow"], { semi: false, quoteProps });
}
