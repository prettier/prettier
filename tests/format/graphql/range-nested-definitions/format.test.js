runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "variable definition",
        code: "query Query(<<<PRETTIER_RANGE_START>>>$value:   Int = 1<<<PRETTIER_RANGE_END>>>) { field(value: $value) }",
      },
      {
        name: "field definition",
        code: "type Query { <<<PRETTIER_RANGE_START>>>field:   String<<<PRETTIER_RANGE_END>>> }",
      },
      {
        name: "enum value definition",
        code: 'enum Choice { <<<PRETTIER_RANGE_START>>>FIRST @deprecated(reason:   "old")<<<PRETTIER_RANGE_END>>> SECOND }',
      },
      {
        name: "input value definition",
        code: 'input Input { <<<PRETTIER_RANGE_START>>>value:   String = "default"<<<PRETTIER_RANGE_END>>> }',
      },
      {
        name: "operation type definition",
        code: "schema { <<<PRETTIER_RANGE_START>>>query:   Query<<<PRETTIER_RANGE_END>>> }",
      },
      {
        name: "field argument definition",
        code: "type Query { field(<<<PRETTIER_RANGE_START>>>value:   Int = 1<<<PRETTIER_RANGE_END>>>): String }",
      },
      {
        name: "directive argument definition",
        code: "directive @example(<<<PRETTIER_RANGE_START>>>value:   Int = 1<<<PRETTIER_RANGE_END>>>) on FIELD",
      },
      {
        name: "fragment variable definition",
        code: "fragment Fragment(<<<PRETTIER_RANGE_START>>>$value:   Int = 1<<<PRETTIER_RANGE_END>>>) on Query { field(value: $value) }",
      },
    ].map(({ name, code }) => ({
      name,
      code: `scalar    Before\n${code}\nscalar    After\n`,
    })),
  },
  ["graphql"],
);
