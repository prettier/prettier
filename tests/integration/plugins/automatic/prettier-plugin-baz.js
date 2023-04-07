import createPlugin from "../../../config/utils/create-plugin.cjs";

const plugin = createPlugin({
  name: "baz",
  print: (text) => `content from \`prettier-plugin-baz.js\` file + ${text}`,
  finalNewLine: false,
});

export default plugin;
