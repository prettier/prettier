runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "line-start inline html remains in paragraph",
        code: "This paragraph has enough words before the inline span so Prettier wraps the span\n<span>inline text</span> and keeps the surrounding text together.\n",
        output:
          "This paragraph has enough words before the inline span so Prettier wraps the span\n<span>inline text</span> and keeps the surrounding text together.\n",
      },
    ],
  },
  ["mdx"],
);
