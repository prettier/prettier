import prettierPluginUppercaseRocks from "../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js";

const plugins = [prettierPluginUppercaseRocks];

runFormatTest(import.meta, ["vue"], { plugins });
runFormatTest(import.meta, ["vue"], {
  plugins,
  embeddedLanguageFormatting: "off",
});
