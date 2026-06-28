import jsxTestSuite from "jsx-test-suite";

const SKIP = new Set();
const testCases = jsxTestSuite.filter(({ id }) => !SKIP.has(id));

const htmlComments = ["0006-e58e.jsx"];

const snippets = testCases
  .filter(({ error }) => !error)
  .map(({ name, input }) => ({ name, filename: name, code: input }));

runFormatTest(
  { importMeta: import.meta, snippets },
  ["babel", "typescript", "flow"],
  {
    errors: {
      babel: htmlComments,
      "babel-ts": htmlComments,
      __babel_estree: htmlComments,
      typescript: htmlComments,
      flow: [
        ...htmlComments,
        "0012-912c.jsx",
        "0019-c21b.jsx",
        "0020-2386.jsx",
        "0023-f709.jsx",
      ],
      hermes: [...htmlComments, "0019-c21b.jsx", "0020-2386.jsx"],
    },
  },
);
