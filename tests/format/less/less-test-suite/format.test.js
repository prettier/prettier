import lessTestSuite from "less-test-suite";

const BUGS = new Set();

const testCases = lessTestSuite.filter(
  ({ error, name }) => !error && !BUGS.has(name),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases.map(({ name, input }) => ({ name, code: input })),
  },
  ["less"],
);
