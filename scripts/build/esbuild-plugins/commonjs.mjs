import fs from "node:fs";

export default function esbuildPluginCommonjs() {
  return {
    name: "commonjs",
    setup(build) {
      const { onEnd, initialOptions: esbuildOptions } = build;

      onEnd(() => {
        const file = esbuildOptions.outfile;

        if (!fs.existsSync(file)) {
          throw new Error(`${file} not exists`);
        }

        const text = fs.readFileSync(file, "utf8").trim();
        const lines = text.split("\n");
        let lastLine = lines[lines.length - 1];

        if (!lastLine.startsWith("module.exports = __toCommonJS(")) {
          throw new Error("Unexpected output.");
        }

        lastLine = lastLine.replace(/;$/, ".default;");
        lines[lines.length - 1] = lastLine;

        fs.writeFileSync(file, lines.join("\n"));
      });
    },
  };
}
