for (const printWidth of [80, 120]) {
  for (const semi of [false, true]) {
    runFormatTest(import.meta, ["typescript"], { printWidth, semi });
  }
}
