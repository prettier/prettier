import createPlugin from "../../utils/create-plugin.cjs";

const plugin = createPlugin({
  name: "uppercase-rocks",
  print: (text, options) =>
    (options.parentParser && text.startsWith("\n")
      ? text.slice(1)
      : text
    ).toUpperCase(),
});

export default plugin;
