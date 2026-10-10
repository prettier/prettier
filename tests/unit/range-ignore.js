import * as prettier from "../../src/index.js";

// Match the issue exactly: the range starts after the ignore comment and ends
// at the semicolon, so the formatter must recover the directive from the AST.
const source = "// prettier-ignore\nconst a  =  [1,2,   3];\n";

for (const parser of ["babel", "flow", "typescript"]) {
  test(`preserves ignored range and cursor (${parser})`, async () => {
    // Check cursors before, inside, and after the selected statement. Since the
    // ignored text stays unchanged, each cursor must keep its original offset.
    for (const cursorOffset of [0, 20, 32, source.length]) {
      // Ignore parser-specific comment metadata; assert the output and cursor.
      expect(
        await prettier.formatWithCursor(source, {
          parser,
          rangeStart: 19,
          rangeEnd: 42,
          cursorOffset,
        }),
      ).toMatchObject({ formatted: source, cursorOffset });
    }
  });

  test(`preserves ignored range with CRLF (${parser})`, async () => {
    // CRLF shifts the statement start by one character. The ignore comment and
    // both original line endings must survive range normalization/restoration.
    const input = source.replaceAll("\n", "\r\n");
    expect(
      await prettier.format(input, {
        parser,
        // The LF fixture uses [19, 42); CRLF adds one byte before this range.
        rangeStart: 20,
        rangeEnd: 43,
        endOfLine: "crlf",
      }),
    ).toBe(input);
  });
}
