import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "Should not support front matter",
        code: outdent`
          ---
          Front Matter content
          ---
        `,
      },
    ],
  },
  [
    "acorn",
    "espree",
    "__ng_action",
    "__ng_binding",
    "__ng_interpolation",
    "__ng_directive",
    "babel",
    "babel-flow",
    "babel-ts",
    "__js_expression",
    "__ts_expression",
    "__vue_expression",
    "__vue_ts_expression",
    "__vue_event_binding",
    "__vue_ts_event_binding",
    "__babel_estree",
    "json",
    "json5",
    "jsonc",
    "json-stringify",
    "flow",
    "graphql",
    "meriyah",
    "typescript",
    // Does not support, but it can parse
    // "yaml",
  ],
);
