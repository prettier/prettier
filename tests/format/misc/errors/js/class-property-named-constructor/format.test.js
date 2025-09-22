import { outdent } from "outdent";

const cases = [
  outdent`
    class Foo {
      constructor
    }
  `,
  outdent`
    class Foo {
      'construct\u{6f}r'
    }
  `,
  outdent`
    class Foo {
      'constructor'
    }
  `,
  outdent`
    class Foo {
      accessor 'construct\u{6f}r'
    }
  `,
  outdent`
    class Foo {
      accessor 'constructor'
    }
  `,
  outdent`
    class Foo {
      accessor constructor
    }
  `,
];

runFormatTest(
  {
    importMeta: import.meta,
    snippets: cases,
  },
  [
    "babel",
    "acorn",
    "espree",
    "meriyah",
    "typescript",
    "babel-ts",
    // https://github.com/oxc-project/oxc/issues/14014
    // "oxc",
    // "oxc-ts",
    "flow",
    "hermes",
  ],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: cases.map((code) => `abstract ${code}`),
  },
  [
    "typescript",
    "babel-ts",
    // "oxc-ts",
  ],
);
