runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      'export *, {} from "foo";',
      'export * as foo, {} from "foo";',
      'export *, {bar} from "foo";',
      'export * as foo, {bar} from "foo";',
      'export * as ns { a } from "x";',
    ],
  },
  ["babel"],
);
