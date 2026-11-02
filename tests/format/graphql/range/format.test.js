runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "schema",
      "scalar Date",
      "type Query",
      "interface Node",
      "union SearchResult",
      "enum Color",
      "input Filter",
      "directive @example",
    ].map((extension) => ({
      name: `extend ${extension}`,
      code: `scalar    Before
extend   ${extension} <<<PRETTIER_RANGE_START>>>@directive(value:   1)<<<PRETTIER_RANGE_END>>>
scalar    After
`,
    })),
  },
  ["graphql"],
);
