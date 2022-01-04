import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.cjs"),
];

run_spec(import.meta, ["vue"], { plugins });
run_spec(import.meta, ["vue"], { plugins, embeddedLanguageFormatting: "off" });
