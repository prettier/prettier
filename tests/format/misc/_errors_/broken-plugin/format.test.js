import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-missing-comments/index.cjs"),
];

runFormatTest(
  { importMeta: import.meta, snippets: ["text"] },
  ["missing-comments"],
  {
    plugins,
  },
);
