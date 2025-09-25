import createPlugin from "../../utils/create-plugin.cjs";

const plugin = createPlugin({
  name: "toml",
  print(text) {
    const res = [];
    for (const line of text.split("\n")) {
      if (line.includes("=")) {
        const [key, value] = line.split("=");
        res.push(`${key.trim()} = ${value.trim()}`);
      } else {
        res.push(line);
      }
    }
    return res.join("\n");
  },
});

export default plugin;
