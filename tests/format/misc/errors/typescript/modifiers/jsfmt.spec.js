import { outdent } from "outdent";

run_spec(
  {
    importMeta: import.meta,
    snippets: [
      "abstract",
      "declare",
      "export",
      "static",
      "private",
      "protected",
      "public",
      // "readonly",
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
  },
  ["babel-ts", "typescript"]
);
