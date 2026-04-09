runFormatTest(
  {
    importMeta: import.meta,
    snippets: ['namespace "a" {}', 'namespace "a";', "namespace a;"],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
