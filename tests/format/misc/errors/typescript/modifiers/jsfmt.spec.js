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
        // "readonly",
      ].map(
        (modifier) => outdent`
          interface Foo {
            ${modifier} e();
          }
        `
      ),
    ],
  },
  ["babel-ts", "typescript"]
);
