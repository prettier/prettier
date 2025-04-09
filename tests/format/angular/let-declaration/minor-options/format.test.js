const snippets = ["@let    foo     =  'Hello'   + ', World'; "];

runFormatTest(
  {
    importMeta: import.meta,
    snippets,
  },
  ["angular"],
  { embeddedLanguageFormatting: "off" },
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets,
  },
  ["angular"],
  { semi: false },
);
