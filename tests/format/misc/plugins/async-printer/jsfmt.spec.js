import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-async-printer/index.cjs"),
];

run_spec(import.meta, ["async-printer"], { plugins });
