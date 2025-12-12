import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // #17807
      outdent`
        Multi${"\\"}
        Line${" ".repeat(2)}
        Setext{"\\"}
        Heading
        =======

        Multi{"\\"}
        Line${" ".repeat(2)}
        Setext{"\\"}
        Heading
        -------
      `,
    ],
  },
  ["markdown"],
  { proseWrap: "always" },
);
