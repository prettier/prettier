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
        code: outdent`
          ""; // should be kept as directive for all parsers https://github.com/prettier/prettier/issues/17458
        `,
        output:
          outdent`
            ""; // should be kept as directive for all parsers https://github.com/prettier/prettier/issues/17458
          ` + "\n",
      },
    ],
  },
  ["babel", "flow", "typescript"],
);
