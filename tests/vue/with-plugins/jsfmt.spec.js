run_spec(__dirname, ["vue"], {
  plugins: [
    require.resolve(
      "../../../tests_config/prettier-plugins/prettier-plugin-uppercase-rocks/"
    ),
  ],
});
