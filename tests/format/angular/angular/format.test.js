runFormatTest(import.meta, ["angular"], { trailingComma: "none" });
runFormatTest(import.meta, ["angular"], { trailingComma: "es5" });
runFormatTest(import.meta, ["angular"], { printWidth: 1 });
runFormatTest(import.meta, ["angular"], {
  htmlWhitespaceSensitivity: "ignore",
});
runFormatTest(import.meta, ["angular"], { bracketSpacing: false });
