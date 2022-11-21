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
      ]),
      outdent`
        interface Foo {
          readonly method();
        }
      `,
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
      ].map((modifier) => `interface Foo<${modifier} T> {}`),
      ...["declare", "readonly"].map(
        (modifier) =>
          outdent`
            class Foo {
              ${modifier} method() {}
            }
          `
      ),
    ],
  },
  ["babel-ts", "typescript"]
);
