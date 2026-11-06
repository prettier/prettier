const makeSnippet = (count) => ({
  name: `${count} binary operators`,
  code: `const value = ${"a + ".repeat(count)}a;\n`,
  output: `const value =\n  ${"a +\n  ".repeat(count)}a;\n`,
});

const isBrowser = process.env.TEST_RUNTIME === "browser";

runFormatTest(
  { importMeta: import.meta, snippets: [makeSnippet(isBrowser ? 12 : 500)] },
  ["babel", "flow", "typescript"],
);

// Comparing deeply nested ASTs exceeds the browser test runner's CBOR limit.
// TypeScript's AST converter can also overflow before printing 2,000 operators.
if (!isBrowser) {
  runFormatTest({ importMeta: import.meta, snippets: [makeSnippet(2000)] }, [
    "babel",
    "flow",
  ]);
}
