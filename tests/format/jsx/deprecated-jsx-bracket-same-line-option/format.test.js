runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
  bracketSameLine: true,
});
runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
  bracketSameLine: false,
});
