runFormatTest(import.meta, ["typescript"]);
runFormatTest(import.meta, ["typescript"], { semi: false });
runFormatTest(import.meta, ["typescript"], {
  experimentalOperatorPosition: "start",
});
