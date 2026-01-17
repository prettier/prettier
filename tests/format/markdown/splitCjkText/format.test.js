const code = Array.from({ length: 6 })
  // less "文" <= [..., "文...文 ", "文...文", ...] => more "文"
  .map((_, i) => ["文".repeat(39 + (i >> 1)), i & 1 ? "" : " "])
  // ["<Line #1>", "<L2>", ...]
  .reduce(
    (previousInputLines, [base, space]) => [
      ...previousInputLines,
      `${base}${space}\n`,
    ],
    [],
  )
  .join("");
// (39 + 40 + 41) * 2 === 40 * 3 * 2 === 40 * 6
// lineWidth is 80 and "文" is double-width
// This is being saved for after Chrome and Safari bug is fixed.
const output = /* `${"文".repeat(40)}\n`.repeat(6) */ `${"文".repeat(40 * 6)}\n`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code,
        name: "Should ignore single trailing space after han before New Line before han",
        output,
      },
    ],
  },
  ["markdown"],
  { proseWrap: "always" },
);
