import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../config/prettier-plugins/prettier-plugin-missing-comments/index.js"),
];

run_spec(import.meta, ["markdown"], { plugins });
