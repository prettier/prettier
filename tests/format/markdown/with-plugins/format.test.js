import prettierPluginToml from "../../../config/prettier-plugins/prettier-plugin-dummy-toml/index.js";

runFormatTest(import.meta, ["markdown"], {
  proseWrap: "always",
  plugins: [prettierPluginToml],
});
