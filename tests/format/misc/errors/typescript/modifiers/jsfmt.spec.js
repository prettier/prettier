import { outdent } from "outdent";

const POSSIBLE_MODIFIERS = [
  "abstract",
  "accessor",
  "async",
  "const",
  "declare",
  "default",
  "export",
  "in",
  "out",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "static",
];

run_spec(
  {
    importMeta: import.meta,
    snippets: [
      // Only `readonly` allowed in some places
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "readonly"
      ).flatMap((modifier) => [
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

      ...["abstract", "static", "private", "protected", "public"].flatMap(
        (modifier) => [
          outdent`
            module Foo {
              ${modifier} module Bar {}
            }
          `,
          outdent`
            module Foo {
              ${modifier} enum Bar {}
            }
          `,
        ]
      ),

      // Only `declare` and `export` allowed in interface
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "declare" && modifier !== "export"
      ).map(
        (modifier) =>
          outdent`
            ${modifier} interface Foo {}
          `
      ),

      // Only `in` and `out` allowed in type parameter
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "in" && modifier !== "out"
      ).map((modifier) => `interface Foo<${modifier} T> {}`),

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
