for (const printWidth of [80, 81, 100, 116, 117, 180]) {
  runFormatTest(import.meta, ["babel", "flow", "typescript"], { printWidth });
}

runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  printWidth: 100,
  singleQuote: true,
});

runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  printWidth: 100,
  objectWrap: "collapse",
});
