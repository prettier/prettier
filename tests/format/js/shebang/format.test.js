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
        name: "Multiline shebang shell shim",
        code: '#!/bin/sh\n":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"\nconst ten = 10;\n',
      },
      {
        name: "Multiline shebang shell shim with ASI protection",
        code: '#!/bin/sh\n":" //; exec /usr/bin/env ts-node --transpile-only "$0" "$@"\n;(() => console.log(1))();\n',
      },
    ],
  },
  ["babel", "flow", "typescript"],
);
