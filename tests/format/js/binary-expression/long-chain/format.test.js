const operandCount = 1800;
const source = `const value = ${Array.from(
  { length: operandCount },
  () => '"a"',
).join(" + ")};\n`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "long binary expression",
        code: source,
        output: source,
      },
    ],
  },
  ["babel", "meriyah"],
  { printWidth: 20_000 },
);
