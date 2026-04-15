import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // https://github.com/micromark/micromark-extension-mdx-expression/blob/2891b75ff9e985c6df208a47348e76ced05dbfed/packages/micromark-extension-mdx-expression/readme.md?plain=1#L249
      "a { b",
      outdent`
        > {a
        b}
      `,
      "<a {b=c}={} d>",
      "<a {...b,c} d>",
      'a {"b" "c"} d',
      'a {var b = "c"} d',
    ],
  },
  ["mdx"],
);
