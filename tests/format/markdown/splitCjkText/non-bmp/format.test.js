// This preamble is unnecessary after #16805
const preamble = "a 字 a 字 a 字";
const code = `${preamble}\n${"葛\u{e0100}\n".repeat(3)}${"𠮷\n".repeat(2)}終\n`;
const output = `${preamble}${"葛\u{e0100}".repeat(3)}${"𠮷".repeat(2)}終\n`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code,
        name: "Make sure non-BMP CJK characters are treated as CJK",
        output,
      },
    ],
  },
  ["markdown"],
  { proseWrap: "never" },
);
