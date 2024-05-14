runFormatTest(import.meta, ["babel", "flow", "typescript"]);
runFormatTest(import.meta, ["babel", "flow", "typescript"], { tabWidth: 4 });
runFormatTest(import.meta, ["babel", "flow", "typescript"], { useTabs: true });
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  useTabs: true,
  tabWidth: 4,
});

runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  experimentalTernaries: true,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  experimentalTernaries: true,
  tabWidth: 4,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  experimentalTernaries: true,
  useTabs: true,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  experimentalTernaries: true,
  useTabs: true,
  tabWidth: 4,
});
