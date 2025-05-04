runFormatTest(import.meta, ["angular"], { printWidth: 10 });
runFormatTest(import.meta, ["angular"], {
  printWidth: 10,
  htmlWhitespaceSensitivity: "css",
});
runFormatTest(import.meta, ["angular"], {
  printWidth: 10,
  htmlWhitespaceSensitivity: "ignore",
});
