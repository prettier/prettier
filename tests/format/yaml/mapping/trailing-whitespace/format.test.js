// For different blocks
const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const trailingSpace = ["", "  ", "\t"];
const newlines = ["", "\n", "\n\n", "\n\n\n"];

const snippets = blockStyles
  .map((blockStyle) =>
    trailingSpace.map((space) =>
      newlines.map((lines) => {
        const code = `foo: ${blockStyle}\n  x\n${space}${lines}`;
        return [code, `${code}\n...`];
      }),
    ),
  )
  .flat(Number.POSITIVE_INFINITY);

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
