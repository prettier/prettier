import { outdent } from "outdent";
import createPlugin from "../../utilities/create-plugin.cjs";

const plugin = createPlugin({
  name: "toml",
  parserName: "dummy-toml-plugin-parser-name",
  print: (text, options) =>
    outdent`
      !!! Formatted by with '${options.parser}' parser
      ${(text.startsWith("!!!")
        ? text.split("\n").slice(1).join("\n")
        : text
      ).trim()}
    `,
});

export default plugin;
