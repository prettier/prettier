runFormatTest(import.meta, ["babel", "typescript", "flow"]);
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  experimentalOperatorPosition: "start",
});
