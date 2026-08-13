import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        alert(
        <!-- comment
        'hello world'
        )
      `,
    ],
  },
  [
    "babel",
    // "acorn",
    // "espree",
    // "meriyah",
    "typescript",
    "babel-ts",
    // "oxc",
    // "oxc-ts",
    // "yuku",
    // "yuku-ts",
    "flow",
    "hermes",
  ],
);
