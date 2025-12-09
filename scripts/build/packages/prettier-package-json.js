import path from "node:path";

function generatePackageJson(packageJson, { packageConfig }) {
  const files = packageConfig.modules.flatMap((module) => module.files);

  return {
    ...packageJson,
    main: "./index.cjs",
    exports: {
      ".": {
        types: "./index.d.ts",
        require: "./index.cjs",
        browser: {
          import: "./standalone.mjs",
          default: "./standalone.js",
        },
        default: "./index.mjs",
      },
      "./*": "./*",
      ...Object.fromEntries(
        files
          .filter((file) => file.output.endsWith(".js"))
          .map((file) => {
            const basename = path.basename(file.output, ".js");
            const isPlugin = file.output.startsWith("plugins/");
            return [
              isPlugin ? `./plugins/${basename}` : `./${basename}`,
              {
                types: `./${file.output.replace(/\.js$/u, ".d.ts")}`,
                // `module-sync` condition can prevent CJS plugins from working: https://github.com/prettier/prettier/issues/17139
                // Perform a test before re-adding it.
                require: `./${file.output}`,
                default: `./${file.output.replace(/\.js$/u, ".mjs")}`,
              },
            ];
          }),
      ),
      // Legacy entries
      // TODO: Remove bellow in v4
      "./esm/standalone.mjs": "./standalone.mjs",
      ...Object.fromEntries(
        files
          .filter(
            (file) =>
              file.output.startsWith("plugins/") &&
              file.output.endsWith(".js") &&
              file.output !== "plugins/estree.js",
          )
          .flatMap((file) => {
            let basename = path.basename(file.output, ".js");
            if (basename === "acorn") {
              basename = "espree";
            }
            return [
              [`./parser-${basename}`, `./${file.output}`],
              [`./parser-${basename}.js`, `./${file.output}`],
              [
                `./esm/parser-${basename}.mjs`,
                `./${file.output.replace(/\.js$/u, ".mjs")}`,
              ],
            ];
          }),
      ),
    },
    scripts: {
      prepublishOnly:
        "node -e \"assert.equal(require('.').version, require('..').version)\"",
    },
  };
}

export { generatePackageJson };
