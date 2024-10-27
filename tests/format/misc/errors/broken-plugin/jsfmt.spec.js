const plugins = [
  require("../../../../config/prettier-plugins/prettier-plugin-missing-comments/"),
];

run_spec({ dirname: __dirname, snippets: ["text"] }, ["missing-comments"], {
  plugins,
});
