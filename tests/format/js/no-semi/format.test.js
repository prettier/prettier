runFormatTest(import.meta, ["babel", "typescript", "flow"], {});
runFormatTest(import.meta, ["babel", "typescript", "flow"], { semi: false });
runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  semi: false,
  experimentalTernaries: true,
});
