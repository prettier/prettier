import lessTestSuite from "less-test-suite";

/* spell-checker: disable */
const SKIP = new Set(["tests-unit/import/import/invalid-css.less"]);
const BUGS = new Set([
  "tests-unit/variables/variable-advanced.less",
  "tests-unit/property-accessors/property-accessors.less",
  "tests-unit/plugin/plugin.less",
  "tests-unit/permissive-parse/permissive-parse.less",
  "tests-unit/parser-property-interp/parser-property-interp.less",
  "tests-unit/mixins-interpolated/mixins-interpolated.less",
  "tests-unit/import/import/invalid-css.less",
  "tests-unit/functions/functions.less",
  "tests-unit/extract-and-length/extract-and-length.less",
  "tests-unit/css-escapes/css-escapes.less",
  "tests-unit/comments/comments.less",
]);
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
