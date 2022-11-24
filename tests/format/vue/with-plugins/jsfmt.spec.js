const plugins = [
  require("../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js"),
  require("../../../config/prettier-plugins/prettier-plugin-dummy-stylus/index.cjs"),
];

run_spec(__dirname, ["vue"], { plugins });
run_spec(__dirname, ["vue"], { plugins, embeddedLanguageFormatting: "off" });
