import prettierPluginDummyToml from "../../../../config/prettier-plugins/prettier-plugin-dummy-toml/index.js";

runFormatTest(import.meta, ["glimmer"], { plugins: [prettierPluginDummyToml] });
