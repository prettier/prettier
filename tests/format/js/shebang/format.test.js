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
    ],
  },
  ["babel", "flow", "typescript"],
);
