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
      {
        name: "keeps the next key in the same nested mapping",
        code: "a:\n  b: |\n    x \n  c: 1",
        output: "a:\n  b: |\n    x \n  c: 1\n",
      },
      {
        name: "keeps the next key of an outer mapping",
        code: "a:\n  b:\n    c: |\n      x \n  d: 1\ne: 2\n",
        output: "a:\n  b:\n    c: |\n      x \n  d: 1\ne: 2\n",
      },
      {
        name: "keeps the next key in the same mapping of a sequence item",
        code: "- run: |\n    echo hi \n  name: x\n",
        output: "- run: |\n    echo hi \n  name: x\n",
      },
      {
        name: "keeps the next item in the same nested sequence",
        code: "- - |\n    x \n  - y\n",
        output: "- - |\n    x \n  - y\n",
      },
      {
        name: "keeps trailing spaces before an end comment",
        code: "a:\n  b: |\n    x \n  # end\nc: 1\n",
        output: "a:\n  b: |\n    x \n  # end\nc: 1\n",
      },
      {
        name: "keeps trailing spaces before an end comment at the root",
        code: "a:\n  b: |\n    x \n# end\nc: 1\n",
        output: "a:\n  b: |\n    x \n# end\nc: 1\n",
      },
      {
        name: "keeps trailing spaces of a kept block before an end comment",
        code: "a:\n  b: |+\n    x \n  # end\nc: 1\n",
        output: "a:\n  b: |+\n    x \n  # end\nc: 1\n",
      },
      {
        name: "keeps trailing spaces of a stripped block before an end comment",
        code: "a:\n  b: |-\n    x \n  # end\nc: 1\n",
        output: "a:\n  b: |-\n    x \n  # end\nc: 1\n",
      },
    ],
  },
  ["yaml"],
);

const nestedSiblingSnippets = [
  ">",
  ">-",
  ">+",
  "|-",
  "|+",
  "|2",
  ">2",
  "|1-",
].flatMap((blockStyle) => {
  // The content of a block with an explicit indentation indicator is indented
  // relative to its key
  const content = " ".repeat(2 + Number(/\d/.exec(blockStyle)?.[0] ?? 2));
  return [
    `a:\n  b: ${blockStyle}\n${content}x \n  c: 1\n`,
    `- run: ${blockStyle}\n${content}x\t\n  name: y\n`,
  ];
});

// The formatted code is the same as the input, so formatting it again can't
// change it
runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      ...nestedSiblingSnippets,
      "a: |\n  x \n\nb: 1\n",
      "a:\n  b: |\n    x \n\n  c: 1\n",
      "a:\n  b: |+\n    x \n\n  c: 1\n",
      "top:\n  - k:\n      e: |2\n          explicit\n      f: |\n        x \n  - z\n",
      "top:\n  - k:\n      d: 0\n      # prettier-ignore\n      e:   [1,\n          2]\n      f: |\n        x \n  - z\n",
    ].map((code) => ({ name: JSON.stringify(code), code, output: code })),
  },
  ["yaml"],
);
