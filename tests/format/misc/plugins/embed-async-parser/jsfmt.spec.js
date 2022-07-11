import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-async-parser/index.cjs"),
  require("../../../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.cjs"),
];

run_spec(import.meta, ["markdown"], { plugins });
