import path from "node:path";
import {
  PROJECT_ROOT,
  DIST_DIR,
  readJson,
  writeJson,
} from "../utils/index.mjs";

async function buildPackageJson({ files }) {
  const packageJson = await readJson(path.join(PROJECT_ROOT, "package.json"));

  const bin = files.find(
    (file) =>
      path.join(PROJECT_ROOT, packageJson.bin) ===
      path.join(PROJECT_ROOT, file.input)
  ).output.file;

  packageJson.bin = `./${bin}`;
  packageJson.main = "./index.cjs";
  packageJson.exports = {
    ".": {
      require: "./index.cjs",
      default: "./index.mjs",
    },
    "./*": "./",
    "./standalone": {
      require: "./standalone.js",
      default: "./esm/standalone.mjs",
    },
    "./doc": {
      require: "./doc.js",
      default: "./esm/doc.mjs",
    },
    ...Object.fromEntries(
      files
        .filter((file) => file.isPlugin && file.output.format === "umd")
        .map((file) => {
          const basename = path.basename(file.output.file, ".js");
          return [
            `./${basename}`,
            {
              require: `./${file.output.file}`,
              default: `./esm/${basename}.mjs`,
            },
          ];
        })
    ),
  };
  // https://github.com/prettier/prettier/pull/13118#discussion_r922708068
  packageJson.engines.node = ">=14";
  delete packageJson.dependencies;
  delete packageJson.devDependencies;
  delete packageJson.browserslist;
  delete packageJson.type;
  delete packageJson.c8;
  delete packageJson.packageManager;
  delete packageJson.resolutions;
  packageJson.scripts = {
    prepublishOnly:
      "node -e \"assert.equal(require('.').version, require('..').version)\"",
  };
  packageJson.files = files.map(({ output: { file } }) => file).sort();

  await writeJson(path.join(DIST_DIR, "package.json"), packageJson);
}

export default buildPackageJson;
