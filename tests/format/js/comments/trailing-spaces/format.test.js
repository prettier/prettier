import { outdent } from "outdent";

const fixtures = {
  importMeta: import.meta,
  snippets: [
    {
      name: "Preserve trailing double spaces in JSDoc",
      code: outdent`
        /**
         * This is a JSDoc comment with two spaces at the end of this line.${" ".repeat(2)}
         */
      `,
      output: outdent`
        /**
         * This is a JSDoc comment with two spaces at the end of this line.${" ".repeat(2)}
         */\n
      `,
    },
    {
      name: "Remove trailing single space in JSDoc",
      code: outdent`
        /**
         * This is a JSDoc comment with one space at the end of this line.${" ".repeat(1)}
         */
      `,
      output: outdent`
        /**
         * This is a JSDoc comment with one space at the end of this line.
         */\n
      `,
    },
    {
      name: "Remove trailing single space in non-JSDoc",
      code: outdent`
        /***
          * This is a JSDoc comment with two spaces at the end of this line.${" ".repeat(2)}
          */
      `,
      output: outdent`
        /***
         * This is a JSDoc comment with two spaces at the end of this line.
         */\n
      `,
    },
  ],
};

runFormatTest(fixtures, ["babel", "flow", "typescript"]);
