import { outdent } from "outdent";

const fixtures = {
  importMeta: import.meta,
  snippets: [
    {
      name: "Preserve trailing double spaces in JSDoc",
      code: outdent`
        /**
         * 2 spaces.${" ".repeat(2)}
         */
      `,
      output: outdent`
        /**
         * 2 spaces.${" ".repeat(2)}
         */\n
      `,
    },
    {
      name: "Misaligned",
      code: outdent`
        /**
           * 2 spaces.${" ".repeat(2)}
        */
      `,
      output: outdent`
        /**
         * 2 spaces.${" ".repeat(2)}
         */\n
      `,
    },
    {
      name: "Non-top-level",
      code: outdent`
        function foo() {
                /**
                 * 2 spaces.${" ".repeat(2)}
                 */
        }
      `,
      output: outdent`
        function foo() {
          /**
           * 2 spaces.${" ".repeat(2)}
           */
        }\n
      `,
    },
    {
      name: "Preserve trailing 2+ spaces in JSDoc",
      code: outdent`
        /**
         * 3 spaces.${" ".repeat(3)}
         */
      `,
      output: outdent`
        /**
         * 3 spaces.${" ".repeat(2)}
         */\n
      `,
    },
    {
      name: "Spaces on start line",
      code: outdent`
        /**${" ".repeat(2)}
         * 2 spaces.${" ".repeat(2)}
         */
      `,
      output: outdent`
        /**
         * 2 spaces.${" ".repeat(2)}
         */\n
      `,
    },
    {
      name: "Remove on blank line",
      code: outdent`
        /**
         *${" ".repeat(2)}
         */
      `,
      output: outdent`
        /**
         *
         */\n
      `,
    },
    {
      name: "Remove trailing single space in JSDoc",
      code: outdent`
        /**
         * 1 space.${" ".repeat(1)}
         */
      `,
      output: outdent`
        /**
         * 1 space.
         */\n
      `,
    },
    /**
    > Each comment must start with a `/**` sequence in order to be recognized by the JSDoc parser.
    > Comments beginning with `/*`, `/***`, or more than 3 stars will be ignored.
    > This is a feature to allow you to suppress parsing of comment blocks.

    https://jsdoc.app/about-getting-started
   */
    {
      name: "Remove trailing single space in non-JSDoc",
      code: outdent`
        /***
          * NOT JSDOC.${" ".repeat(2)}
          */
      `,
      output: outdent`
        /***
         * NOT JSDOC.
         */\n
      `,
    },
  ],
};

runFormatTest(fixtures, ["babel", "flow", "typescript"]);
