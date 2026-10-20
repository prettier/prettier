// https://github.com/prettier/prettier/issues/8701
const snippets = [
  {
    name: "Should not add a space next to NO-BREAK SPACE (U+00A0) before Chinese",
    code: "a\u{a0}是\na是\n",
  },
  {
    name: "Should keep NO-BREAK SPACE (U+00A0) between Chinese and Latin",
    code: "中文\u{a0}English\u{a0}中文\n",
  },
  {
    name: "Should keep NO-BREAK SPACE (U+00A0) between Chinese characters",
    code: "中\u{a0}文\n",
  },
].map((snippet) => ({ ...snippet, output: snippet.code }));

runFormatTest({ importMeta: import.meta, snippets }, ["markdown"], {
  proseWrap: "always",
});
runFormatTest({ importMeta: import.meta, snippets }, ["markdown"], {
  proseWrap: "preserve",
});
runFormatTest({ importMeta: import.meta, snippets }, ["markdown"], {
  proseWrap: "never",
});
