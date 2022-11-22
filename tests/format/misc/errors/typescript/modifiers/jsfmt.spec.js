import { outdent } from "outdent";

run_spec(
  {
    importMeta: import.meta,
    snippets: [
      ...[
        "abstract",
        "declare",
        "export",
        "static",
        "private",
        "protected",
        "public",
        "in",
        "out",
        "override",
        "async",
      ].flatMap((modifier) => [
        outdent`
          interface Foo {
            ${modifier} method();
          }
        `,
        outdent`
          interface Foo {
            ${modifier} property;
          }
        `,
        // index signature
        outdent`
          interface Foo {
            ${modifier} [index: string]: number
          }
        `,
        outdent`
          const foo: {
            ${modifier} [index: string] : string
          } = {};
        `,
      ]),
      outdent`
        interface Foo {
          readonly method();
        }
      `,
      // TODO[@fisker]: Fix these tests
      // ...["abstract", "static", "private", "protected", "public"].map(
      //   (modifier) =>
      //     outdent`
      //       module Foo {
      //         ${modifier} module Bar {}
      //       }
      //     `
      // ),
      ...[
        "abstract",
        "declare",
        "export",
        "static",
        "private",
        "protected",
        "public",
        "readonly",
        "override",
        "async",
        "enum",
      ].map((modifier) => `interface Foo<${modifier} T> {}`),
      ...["declare", "readonly"].map(
        (modifier) =>
          outdent`
            class Foo {
              ${modifier} method() {}
            }
          `
      ),
      outdent`
        class Foo {
          declare get getter() {}
        }
      `,
      outdent`
        class Foo {
          declare set setter(v) {}
        }
      `,
    ],
  },
  ["babel-ts", "typescript"]
);
