import createPlugin from "../../utils/create-plugin.cjs";

const plugin = createPlugin({
  name: "uppercase-rocks",
  print: (text) => text.toUpperCase(),
});

export default plugin;
