run_spec(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
  bracketSameLine: true,
});
run_spec(import.meta, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
  bracketSameLine: false,
});
