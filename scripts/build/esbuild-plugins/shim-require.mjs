import fs from "node:fs";
import { outdent } from "outdent";

export default function esbuildPluginShimRequire() {
  return {
    name: "shim-require",
    setup(build) {
      const { onEnd, initialOptions: esbuildOptions } = build;

      onEnd(() => {
        const file = esbuildOptions.outfile;

        if (!fs.existsSync(file)) {
          throw new Error(`${file} not exists`);
        }

        const text = fs.readFileSync(file, "utf8");

        // Use `__prettierCreateRequire` to avoid possible conflicts
        fs.writeFileSync(
          file,
          outdent`
            import { createRequire as __prettierCreateRequire } from "module";
            const require = __prettierCreateRequire(import.meta.url);

            ${text}
          `
        );
      });
    },
  };
}
