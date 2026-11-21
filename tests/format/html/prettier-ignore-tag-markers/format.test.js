for (const htmlWhitespaceSensitivity of ["css", "ignore", "strict"]) {
  for (const printWidth of [1, 80]) {
    runFormatTest(import.meta, ["html"], {
      htmlWhitespaceSensitivity,
      printWidth,
    });
  }
}
