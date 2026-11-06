const source = `const value = ${"a + ".repeat(2000)}a;\n`;
const output = `const value =\n  ${"a +\n  ".repeat(2000)}a;\n`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "long binary expression",
        code: source,
        output,
      },
    ],
  },
  ["babel", "flow", "typescript"],
  { errors: { typescript: true } },
);
