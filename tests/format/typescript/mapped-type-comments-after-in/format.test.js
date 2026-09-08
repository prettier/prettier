import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "ignore comment after in (issue 15550)",
        code: outdent`
          type A = {
            [K in
              // prettier-ignore
              B  |  C
            ]: D
          }
        `,
        output:
          outdent`
            type A = {
              [
                K in // prettier-ignore
                B  |  C
              ]: D;
            };
          ` + "\n",
      },
    ],
  },
  ["typescript", "babel-ts"],
);
