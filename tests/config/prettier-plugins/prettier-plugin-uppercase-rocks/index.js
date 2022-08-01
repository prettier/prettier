import createPlugin from "../../utils/create-plugin.cjs";

export default createPlugin({
  name: "uppercase-rocks",
  print: (text) => text.toUpperCase(),
});
