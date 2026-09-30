const blockStyles = ["|", ">", "|+", "|-", ">+", ">-"];
const trailingSpace = ["", " ".repeat(3), "  \t"];
const newlines = ["", "\n", "\n\n", "\n".repeat(3)];

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

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "preserves trailing spaces in a stripped block literal",
        code: "foo: |-\n  value  \n",
        output: "foo: |-\n  value  \n",
      },
      {
        name: "preserves trailing spaces before the next mapping item",
        code: "foo: |-\n  value  \nbar: baz\n",
        output: "foo: |-\n  value  \nbar: baz\n",
      },
      {
        name: "preserves a trailing tab before the next sequence item",
        code: "- >-\n  value\t\n- next\n",
        output: "- >-\n  value\t\n- next\n",
      },
      {
        name: "preserves trailing spaces before the next document",
        code: "foo: |-\n  value  \n---\nbar: baz\n",
        output: "foo: |-\n  value  \n---\nbar: baz\n",
      },
    ],
  },
  ["yaml"],
);
