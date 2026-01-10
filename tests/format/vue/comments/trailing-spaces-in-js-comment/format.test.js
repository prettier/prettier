import { outdent } from "outdent";

const fixtures = {
  importMeta: import.meta,
  snippets: [
    {
      name: "Preserve trailing double spaces in JSDoc",
      code: outdent`
        <script>
        function foo
        (
                              uglyParameter,
        toEnsure, thisCode,
        isFormatted, byJsParser) {
          /**
          * Should not break when html parser add indention.${" ".repeat(2)}
          */
        }
        </script>
      `,
      output: outdent`
        <script>
          function foo(uglyParameter, toEnsure, thisCode, isFormatted, byJsParser) {
            /**
             * Should not break when html parser add indention.${" ".repeat(2)}
             */
          }
        </script>\n
      `,
    },
  ],
};

runFormatTest(fixtures, ["vue"], { vueIndentScriptAndStyle: true });
