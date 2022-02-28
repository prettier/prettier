import fs from "node:fs";

export default function esbuildPluginInteropDefault() {
  return {
    name: "interop-default",
    setup(build) {
      const { onEnd, initialOptions: esbuildOptions } = build;

      onEnd(() => {
        const file = esbuildOptions.outfile;

        if (!fs.existsSync(file)) {
          throw new Error(`${file} not exists`);
        }

        const text = fs.readFileSync(file, "utf8").trim();
        const lines = text.split("\n");
        if (
          !lines[lines.length - 3].startsWith(
            "module.exports = __toCommonJS("
          ) ||
          lines[lines.length - 2] !==
            "// Annotate the CommonJS export names for ESM import in node:" ||
          lines[lines.length - 1] !== "0 && (module.exports = {});"
        ) {
          throw new Error("Unexpected output.");
        }

        lines[lines.length - 3] = lines[lines.length - 3].replace(
          /;$/,
          ".default;"
        );
        lines.length -= 2;

        fs.writeFileSync(file, lines.join("\n"));
      });
    },
  };
}
