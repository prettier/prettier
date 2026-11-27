runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      { name: "empty nested item (issue 17104)", code: "- foo\n  - \n" },
      {
        name: "adjacent nested lists",
        code: "- foo\n  - \n  - bar\n  * baz\n",
      },
      { name: "blank line before nested list", code: "- foo\n\n  - \n" },
      { name: "nonempty first item", code: "- foo\n  - bar\n  - \n" },
      { name: "nested list without paragraph", code: "- - \n" },
    ],
  },
  ["mdx"],
);
