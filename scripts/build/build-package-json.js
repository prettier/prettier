import path from "node:path";
import { PROJECT_ROOT, readJson, writeJson } from "../utils/index.js";

const keysToKeep = [
  "name",
  "version",
  "description",
  "bin",
  "repository",
  "funding",
  "homepage",
  "author",
  "license",
  "main",
  "browser",
  "unpkg",
  "exports",
  "engines",
  "files",
  "preferUnplugged",
];

async function buildPackageJson({ packageConfig, file }) {
  const { distDirectory, files } = packageConfig;
  const packageJson = await readJson(path.join(PROJECT_ROOT, file.input));

  const bin = files.find(
    (file) =>
      path.join(PROJECT_ROOT, packageJson.bin) ===
      path.join(PROJECT_ROOT, file.input),
  ).output.file;

  const overrides = {
    bin: `./${bin}`,
    main: "./index.cjs",
    engines: {
      ...packageJson.engines,
      // https://github.com/prettier/prettier/pull/13118#discussion_r922708068
      // Don't delete, comment out if we don't want override
      node: ">=14",
    },
    type: "commonjs",
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
          .filter((file) => file.output.format === "umd")
          .map((file) => {
            const basename = path.basename(file.output.file, ".js");
            return [
              file.isPlugin ? `./plugins/${basename}` : `./${basename}`,
              {
                types: `./${file.output.file.replace(/\.js$/u, ".d.ts")}`,
                // `module-sync` condition can prevent CJS plugins from working: https://github.com/prettier/prettier/issues/17139
                // Perform a test before re-adding it.
                require: `./${file.output.file}`,
                default: `./${file.output.file.replace(/\.js$/u, ".mjs")}`,
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
              file.isPlugin &&
              file.output.format === "umd" &&
              file.output.file !== "plugins/estree.js",
          )
          .flatMap((file) => {
            let basename = path.basename(file.output.file, ".js");
            if (basename === "acorn") {
              basename = "espree";
            }
            return [
              [`./parser-${basename}`, `./${file.output.file}`],
              [`./parser-${basename}.js`, `./${file.output.file}`],
              [
                `./esm/parser-${basename}.mjs`,
                `./${file.output.file.replace(/\.js$/u, ".mjs")}`,
              ],
            ];
          }),
      ),
    },
    files: files.map(({ output: { file } }) => file).sort(),
    scripts: {
      prepublishOnly:
        "node -e \"assert.equal(require('.').version, require('..').version)\"",
    },
    peerDependencies: {
      // Add `^` here, so we don't need release Prettier user can still update CLI
      "@prettier/cli": `^${packageJson.dependencies["@prettier/cli"]}`,
    },
    peerDependenciesMeta: {
      "@prettier/cli": {
        optional: true,
      },
    },
  };

  await writeJson(
    path.join(distDirectory, file.output.file),
    Object.assign(pick(packageJson, keysToKeep), overrides),
  );
}

function pick(object, keys) {
  keys = new Set(keys);
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => keys.has(key)),
  );
}

export default buildPackageJson;
