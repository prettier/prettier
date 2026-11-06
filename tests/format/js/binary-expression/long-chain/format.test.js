const makeSnippet = (count) => ({
  name: `${count} binary operators`,
  code: `const value = ${"a + ".repeat(count)}a;\n`,
  output: `const value =\n  ${"a +\n  ".repeat(count)}a;\n`,
});

runFormatTest(
  { importMeta: import.meta, snippets: [makeSnippet(500)] },
  ["babel", "flow", "typescript"],
);

// TypeScript's AST converter can overflow before the printer runs on a
// 2,000-operator chain, so the stress test uses the other parsers.
runFormatTest(
  { importMeta: import.meta, snippets: [makeSnippet(2000)] },
  ["babel", "flow"],
);
