import lessTestSuite from "less-test-suite";

/* spell-checker: disable */
const SKIP = new Set([
  "tests-unit/import/import/invalid-css.less",
  "tests-unit/permissive-parse/permissive-parse.less",
]);
const BUGS = new Set();
/* spell-checker: enable */

const testCases = lessTestSuite.filter(
  ({ error, name }) => !error && !SKIP.has(name) && !BUGS.has(name),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases.map(({ name, input }) => ({
      name,
      filename: name,
      code: input,
    })),
  },
  ["less"],
);
