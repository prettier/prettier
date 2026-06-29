import graphqlTestSuite from "graphql-test-suite";

const BUGS = new Set();

const testCases = graphqlTestSuite.filter(
  ({ error, name }) => !error && !BUGS.has(name),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases.map(({ name, input }) => ({ name, code: input })),
  },
  ["graphql"],
);
