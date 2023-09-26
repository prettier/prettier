export default {
  overrides: [
    {
      files: ["*.foo"],
      options: {
        plugins: ["../../plugins/defaultOptions/plugin.cjs"]
      }
    }
  ]
};
