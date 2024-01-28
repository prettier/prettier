runFormatTest(import.meta, ["babel", "flow", "typescript"]);
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  useTabs: true,
  tabWidth: 8,
});
