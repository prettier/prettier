import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        subscription NoRootField {
        }
      `,
      outdent`
        subscription {
        }
      `,
      outdent`
        subscription {
          ...Empty
        }
        fragment Empty on SubscriptionRoot {
        }
      `,
      outdent`
        subscription NoInfiniteLoop {
          ...A
        }
        fragment A on SubscriptionRoot {
          ...A
        }
      `,
    ],
  },
  ["graphql"],
);
