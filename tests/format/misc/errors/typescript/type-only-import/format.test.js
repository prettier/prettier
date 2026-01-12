runFormatTest(
  {
    importMeta: import.meta,
    snippets: ['import type foo, {} from "foo"'],
  },
  [
    "typescript",
    // `babel-ts` didn't reject
    // "babel-ts",
    "oxc-ts",
  ],
);
runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      'import type foo, {named} from "foo"',
      'import type foo, * as namespace from "foo"',
    ],
  },
  ["typescript", "babel-ts", "oxc-ts"],
);
