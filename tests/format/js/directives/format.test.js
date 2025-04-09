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
    ],
  },
  ["babel", "flow", "typescript"],
);
