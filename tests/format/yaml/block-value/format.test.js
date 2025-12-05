const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const trailingSpace = ["", "  ", "\t"];
const newlines = ["", "\n", "\n\n", "\n\n\n"];

const snippets = blockStyles.flatMap((blockStyle) =>
  trailingSpace.flatMap((space) =>
    newlines.flatMap((lines) =>
      [
        `foo: ${blockStyle}\n${lines}`,
        // `foo: ${blockStyle}\n  ${space}${lines}`,
        `foo: ${blockStyle}\n  x\n${lines}`,
        `foo: ${blockStyle}\n  x\n${space}\n${lines}`,
      ].flatMap((code) => [code, `${code}\n...`]),
    ),
  ),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: snippets.map((code) => ({
      name: JSON.stringify(code),
      code,
    })),
  },
  ["yaml"],
);
