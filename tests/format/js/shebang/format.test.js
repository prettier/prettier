runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node",
      },
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node\n",
      },
      {
        name: "Shell trampoline shebang",
        code: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"
const ten = 10;`,
        output: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"
const ten = 10;
`,
      },
      {
        name: "Shell trampoline shebang before array expression",
        code: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"

;[].forEach();`,
        output: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"

;[].forEach();
`,
      },
      {
        name: "Shell trampoline shebang before parenthesized call",
        code: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"

;(() => console.log(1))();`,
        output: `#!/bin/sh
":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"

;(() => console.log(1))();
`,
      },
    ],
  },
  ["babel", "flow", "typescript"],
);
