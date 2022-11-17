import { outdent } from "outdent";

run_spec(
  {
    importMeta: import.meta,
    snippets: [
      "foo as any = 10;",
      "({ a: b as any = 2000 } = x);",
      "<string>foo = '100';",
      ...[
        "abstract",
        "declare",
        "export",
        "static",
        "private",
        "protected",
        "public",
        "readonly",
      ].map(
        (modifier) => outdent`
          interface Foo {
            ${modifier} e();
          }
        `
      ),
    ],
  },
  ["babel-ts"]
);
