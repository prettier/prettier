const operandCount = 1800;
const source = `const value = ${Array.from(
  { length: operandCount },
  () => '"a"',
).join(" + ")};`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "long binary expression",
        code: source,
        output: `${source}\n`,
      },
    ],
  },
  ["babel", "meriyah"],
  { printWidth: 20_000 },
);
