import prettierPluginToml from "../../../config/prettier-plugins/prettier-plugin-toml/index.js";

runFormatTest(import.meta, ["markdown"], {
  proseWrap: "always",
  plugins: [prettierPluginToml],
});
