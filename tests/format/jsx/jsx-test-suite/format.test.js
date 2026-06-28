import jsxTestSuite from "jsx-test-suite";

const SKIP = new Set([
  // HTML Comment
  "e58e",
]);

const snippets = jsxTestSuite
  .filter(({ error, id }) => !error && !SKIP.has(id))
  .map(({ name, input }) => ({ name, filename: name, code: input }));

runFormatTest(
  { importMeta: import.meta, snippets },
  ["babel", "typescript", "flow"],
  {
    errors: {
      flow: [
        "0012-912c.jsx",
        "0019-c21b.jsx",
        "0020-2386.jsx",
        "0023-f709.jsx",
      ],
      hermes: ["0019-c21b.jsx", "0020-2386.jsx"],
    },
  },
);
