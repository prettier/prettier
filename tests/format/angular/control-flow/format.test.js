runFormatTest(import.meta, ["angular"]);
runFormatTest(import.meta, ["angular"], {
  htmlWhitespaceSensitivity: "strict",
});
runFormatTest(import.meta, ["angular"], {
  htmlWhitespaceSensitivity: "ignore",
});
