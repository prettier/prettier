const fixtures = {
  importMeta: import.meta,
  snippets: [
    "var a = { /* comment */      \nb };", // trailing whitespace after comment
    "var a = { /* comment */\nb };",
  ],
};

runFormatTest(fixtures, ["babel", "flow", "typescript"]);
runFormatTest(fixtures, ["babel", "flow", "typescript"], { semi: false });
