export default {
  overrides: [
    {
      files: ["*.foo"],
      options: {
        plugins: ["../../plugins/extensions/plugin.cjs"]
      }
    },
    {
      files: ["*.bar"],
      options: {
        plugins: ["../../plugins/extensions2/plugin.cjs"]
      }
    }
  ]
};
