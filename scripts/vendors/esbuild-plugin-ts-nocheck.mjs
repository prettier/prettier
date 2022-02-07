import fs from "node:fs";

const tsNoCheck = "// @ts-nocheck\n// This file is generated automatically\n";

export default function esbuildPluginTsNocheck() {
  return {
    name: "ts-no-check",
    setup(build) {
      const options = build.initialOptions;
      const { outfile } = options;
      build.onEnd(() => {
        if (!fs.existsSync(outfile)) {
          throw new Error(`${outfile} not exists`);
        }
        const text = fs.readFileSync(outfile, "utf8");
        fs.writeFileSync(outfile, tsNoCheck + text);
      });
    },
  };
}
