const { outdent } = require("outdent");
const indent = (text) =>
  text
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");

const snippets = [
  "'use strict' /* comment */;",
  outdent`
    'use strict' // comment
  `,
  outdent`
    'use strict';

    /* comment */
    (function () {})();
  `,
  outdent`
    'use strict';

    // comment
    (function () {})();
  `,
].flatMap((code) => [
  code,
  outdent`
    function foo() {
    ${indent(code)}
    }
  `,
]);

run_spec({ dirname: __dirname, snippets }, ["babel", "flow", "typescript"]);
run_spec({ dirname: __dirname, snippets }, ["babel", "flow", "typescript"], {
  semi: false,
});
