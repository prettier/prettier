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
      ].map((modifier) => `interface Foo<${modifier} T> {}`),
    ],
  },
  ["babel-ts", "typescript"]
);
