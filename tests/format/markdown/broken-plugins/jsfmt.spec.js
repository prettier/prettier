const plugins = [
  require("../../../config/prettier-plugins/prettier-plugin-missing-comments/"),
];

run_spec(__dirname, ["markdown"], { plugins });
