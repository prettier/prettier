const { outdent } = require("outdent");
const indent = (text) =>
  text
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");
// TODO: Remove this when we drop support for Node.js v10
// eslint-disable-next-line unicorn/prefer-spread
const flat = (array) => [].concat(...array);

const snippets = flat(
  [
    "/* comment */ 'use strict';",
    "'use strict' /* comment */;",
    outdent`
      // comment
      'use strict';
    `,
    outdent`
      'use strict' // comment
    `,
    outdent`
      'use strict';
      /* comment */
      (function () {})();
    `,
    outdent`
      /* comment */
      'use strict';
      (function () {})();
    `,
    outdent`
      'use strict';
      // comment
      (function () {})();
    `,
    outdent`
      // comment
      'use strict';
      (function () {})();
    `,
  ].map((code) => [
    code,
    outdent`
      function foo() {
      ${indent(code)}
      }
    `,
  ])
);

run_spec({ dirname: __dirname, snippets }, ["babel", "flow", "typescript"]);
run_spec({ dirname: __dirname, snippets }, ["babel", "flow", "typescript"], {
  semi: false,
});
