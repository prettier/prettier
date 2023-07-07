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

        const text = fs.readFileSync(file, "utf8");

        // Use `__prettier` prefix to avoid possible conflicts
        fs.writeFileSync(
          file,
          outdent`
            import { createRequire as __prettierCreateRequire } from "module";
            import { fileURLToPath as __prettierFileUrlToPath } from "url";
            import { dirname as __prettierDirname } from "path";
            const require = __prettierCreateRequire(import.meta.url);
            const __filename = __prettierFileUrlToPath(import.meta.url);
            const __dirname = __prettierDirname(__filename);

            ${text}
          `,
        );
      });
    },
  };
}
