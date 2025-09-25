import createPlugin from "../../utils/create-plugin.cjs";

const COMMENT = "/* Formatted by toml plugin */";
export default createPlugin({
  name: "toml",
  print: (text) => COMMENT + "\n" + text.replace(COMMENT, "").trim(),
});
