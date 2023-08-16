import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-missing-comments/index.cjs"),
];

run_spec(
  { importMeta: import.meta, snippets: ["text"] },
  ["missing-comments"],
  {
    plugins,
  },
);
