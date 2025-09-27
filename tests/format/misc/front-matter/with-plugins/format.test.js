import { outdent } from "outdent";
import prettierPluginToml from "../../../../config/prettier-plugins/prettier-plugin-dummy-toml/index.js";

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
  {
    proseWrap: "always",
    plugins: [prettierPluginToml],
  },
);
