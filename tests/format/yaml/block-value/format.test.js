const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const newlines = ["", "\n", "\n\n", "\n\n\n"];

const snippets = blockStyles.flatMap((blockStyle) =>
  newlines.flatMap((lines) =>
    [
      `foo: ${blockStyle}\n${lines}`,
      `foo: ${blockStyle}\n  x\n${lines}`,
    ].flatMap((code) => [code, `${code}\n...`]),
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
