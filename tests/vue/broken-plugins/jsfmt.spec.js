const plugins = [
  require.resolve(
    "../../../tests_config/prettier-plugins/prettier-plugin-missing-comments/"
  ),
];

run_spec(__dirname, ["vue"], { plugins });
