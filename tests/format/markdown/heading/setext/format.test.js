import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // #17807
      outdent`
        Multi${"\\"}
        Line${" ".repeat(2)}
        Setext${"\\"}
        Heading
        =======

        Multi${"\\"}
        Line${" ".repeat(2)}
        Setext${"\\"}
        Heading
        -------
      `,
      // https://spec.commonmark.org/0.31.2/#example-215
      outdent`
        [foo]: /url{" "}
          bar
        ===
      `,
    ],
  },
  ["markdown"],
  { proseWrap: "always" },
);
