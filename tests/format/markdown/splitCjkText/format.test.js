const snippets = [
  {
    name: "Should ignore single trailing space after han before New Line before han",
    code: Array.from(
      { length: 6 },
      // less "文" <= [..., "文...文 ", "文...文", ...] => more "文"
      (_, i) => ["文".repeat(39 + (i >> 1)), i & 1 ? "" : " "],
    )
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
    get output() {
      /* `${"文".repeat(40)}\n`.repeat(6) */
      return this.code.replace(/ (?=\n)/g, "");
    },
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
    // Note: replaceAll is not supported in Node 14.
    // In CSS, a line break between a CJK and a non-CJK character is always interchangeable
    // with a space, but Prettier v3 made a design mistake where, in some cases,
    // it was treated as equivalent to being deleted
    // (see https://github.com/prettier/prettier/issues/14936).
    // Therefore, .replace is disabled until it gets fixed in
    // https://github.com/prettier/prettier/pull/16805.
    output: code, // `${code.replace(/\n/g, "")}\n`,
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
