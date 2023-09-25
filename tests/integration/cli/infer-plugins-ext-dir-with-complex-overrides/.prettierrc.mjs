export default {
  overrides: [
    {
      files: ["dir/*.foo"],
      options: {
        plugins: ["../../plugins/extensions/plugin.cjs"]
      }
    },
  ]
};
