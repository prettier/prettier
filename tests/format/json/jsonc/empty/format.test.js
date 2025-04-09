import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // "// Only line comment",
      // "/* Only block comment */",
      outdent`
        // Line comment 1
            /** Block comment 1 */
            // Line comment 2
              /** Block comment 3 */
      `,
    ],
  },
  ["jsonc", "json", "json5", "json-stringify"],
  {
    errors: {
      json: true,
      json5: true,
      "json-stringify": true,
    },
  },
);
