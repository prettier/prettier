const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-missing-comments/index.js"),
];

run_spec({ importMeta: import.meta, snippets: ["text"] }, ["missing-comments"], {
  plugins,
});
