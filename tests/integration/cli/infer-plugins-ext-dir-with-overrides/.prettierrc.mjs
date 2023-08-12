export default {
  overrides: [
    {
      files: ["*.foo"],
      options: {
        plugins: ["../../plugins/extensions/plugin.cjs"]
      }
    }
  ]
};
