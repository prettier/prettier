import fs from "node:fs";
import { outdent } from "outdent";

export default function esbuildPluginShimCommonjsObjects() {
  return {
    name: "shim-commonjs-objects",
    setup(build) {
      const { onEnd, initialOptions: esbuildOptions } = build;

      onEnd(() => {
        const file = esbuildOptions.outfile;

        if (!fs.existsSync(file)) {
          throw new Error(`${file} not exists`);
        }

        const lines = fs.readFileSync(file, "utf8").split("\n");

        const before = [];
        const after = lines;

        const [firstLine] = lines;
        if (firstLine.startsWith("#!")) {
          before.push(after.shift(), "");
        }

        // Use `__prettier` prefix to avoid possible conflicts
        fs.writeFileSync(
          file,
          [
            ...before,
            outdent`
              import { createRequire as __prettierCreateRequire } from "module";
              import { fileURLToPath as __prettierFileUrlToPath } from "url";
              import { dirname as __prettierDirname } from "path";

              var require = __prettierCreateRequire(import.meta.url);
              var __filename = __prettierFileUrlToPath(import.meta.url);
              var __dirname = __prettierDirname(__filename);
            `,
            ...after,
          ].join("\n"),
        );
      });
    },
  };
}
