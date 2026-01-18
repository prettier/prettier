const snippets = [
  {
    name: "Should ignore single trailing space after han before New Line before han",
    code: Array.from({ length: 6 })
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
      .join(""),
    // (39 + 40 + 41) * 2 === 40 * 3 * 2 === 40 * 6
    // lineWidth is 80 and "文" is double-width
    // This is being saved for after Chrome and Safari bug is fixed.
    output: /* `${"文".repeat(40)}\n`.repeat(6) */ `${"文".repeat(40 * 6)}\n`,
  },
];

{
  // Switches to insert-space (2.x-style) mode
  const afterword = "测试 Test テスト Test";
  const punctuationLike = [
    0x3000, // Fullwidth Space but should be treated like punctuation
    0x301c, // Genuine CJ(K) punctuation
    0xff5e, // Nearly equivalent to U+301C but its Unicode category is "Sm"
    0x1f221, // "end" symbol. Should be placed at end
  ];
  const code = `${punctuationLike.map((cp) => `U+${cp.toString(16).toUpperCase()}${String.fromCodePoint(cp)}`).join("\n")} ${afterword}\n`;
  snippets.push({
    name: "Should remove newline around CJ(K) punctuation(-like)",
    code,
    output: `${code.replaceAll("\n", "")}\n`,
  });
}

runFormatTest(
  {
    importMeta: import.meta,
    snippets,
  },
  ["markdown"],
  { proseWrap: "always" },
);
