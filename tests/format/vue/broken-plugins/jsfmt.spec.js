const plugins = [
  require("../../../config/prettier-plugins/prettier-plugin-missing-comments/index.js"),
];

run_spec(import.meta, ["vue"], { plugins });
