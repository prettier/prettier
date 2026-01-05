// These two cases should both be syntax error
// https://github.com/typescript-eslint/typescript-eslint/pull/11930
// runFormatTest(
//   {
//     importMeta: import.meta,
//     snippets: [
//       'import type foo, {} from "foo"',
//       'import type foo, {named} from "foo"',
//     ],
//   },
//   ["typescript", "babel-ts", "oxc-ts"],
// );
runFormatTest(
  {
    importMeta: import.meta,
    snippets: ['import type foo, {named} from "foo"'],
  },
  ["babel-ts", "oxc-ts"],
);
