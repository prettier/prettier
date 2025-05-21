import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: outdent`
          'use strict';

          // comment
        `,
        output:
          outdent`
            "use strict";

            // comment
          ` + "\n",
      },
      {
        code: outdent`
          'use strict';
          // comment
        `,
        output:
          outdent`
            "use strict";
            // comment
          ` + "\n",
      },
      {
        code:
          outdent`
            'use strict';

            // comment
          ` + "\n",
        output:
          outdent`
            "use strict";

            // comment
          ` + "\n",
      },
      {
        // should be kept as directive for all parsers https://github.com/prettier/prettier/issues/17458
        code: '"";',
        output: '"";' + "\n",
      },
    ],
  },
  ["babel", "flow", "typescript"],
);
