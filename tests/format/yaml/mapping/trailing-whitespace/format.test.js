const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const trailingSpaces = ["", "  ", "\t"];
const newlines = ["", "\n", "\n\n", "\n\n\n"];

const emptyBlockTests = blockStyles.flatMap((style) =>
  trailingSpaces.flatMap((space) =>
    newlines.map((nl) => `foo: ${style}${space}${nl}`),
  ),
);

const contentBlockTests = ["|", ">"].flatMap((style) =>
  ["   ", "  \t"].flatMap((space) =>
    ["", "\n", "\n\n"].map((nl) => `foo: ${style}\n  x\n${space}${nl}`),
  ),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [...emptyBlockTests, ...contentBlockTests],
  },
  ["yaml"],
);
