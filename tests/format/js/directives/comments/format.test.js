import { outdent } from "outdent";
const indent = (text) =>
  text
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");

const snippets = [
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
].flatMap((code) => [
  code,
  outdent`
    function foo() {
    ${indent(code)}
    }
  `,
]);

runFormatTest({ importMeta: import.meta, snippets }, [
  "babel",
  "flow",
  "typescript",
]);
runFormatTest(
  { importMeta: import.meta, snippets },
  ["babel", "flow", "typescript"],
  {
    semi: false,
  },
);
