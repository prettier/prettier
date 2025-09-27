import { outdent } from "outdent";
import prettierPluginDummyToml from "../../../../config/prettier-plugins/prettier-plugin-dummy-toml/index.js";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      outdent`
        +++
        TOML Front Matter content
        +++
      `,
      outdent`
        ---toml
        TOML Front Matter content
        ---
      `,
    ],
  },
  ["markdown", "mdx", "css", "scss", "less", "html"],
  { plugins: [prettierPluginDummyToml] },
);
