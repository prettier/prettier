// This preamble is unnecessary after #16805
const preamble = "a 字 a 字 a 字";
const code = `${preamble}\n${"葛\u{e0100}\n".repeat(3)}${"𠮷\n".repeat(2)}終\n`;
// Once browser behavior is standardized across browsers, comment out output and switch to the output below.
// const output = `${preamble}${"葛\u{e0100}".repeat(3)}${"𠮷".repeat(2)}終\n`;

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code,
        name: "Make sure non-BMP CJK characters are treated as CJK",
        output: code,
      },
    ],
  },
  ["markdown"],
  { proseWrap: "never" },
);
