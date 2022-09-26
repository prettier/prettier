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
    ...Object.fromEntries(
      files
        .filter((file) => file.output.format === "umd")
        .map((file) => {
          const basename = path.basename(file.output.file, ".js");
          return [
            file.isPlugin ? `./plugins/${basename}` : `./${basename}`,
            {
              require: `./${file.output.file}`,
              default: `./${file.output.file.replace(/\.js$/, ".mjs")}`,
            },
          ];
        })
    ),
    // Legacy entries
    // TODO: Remove bellow in v4
    "./esm/standalone.mjs": "./standalone.mjs",
    ...Object.fromEntries(
      files
        .filter((file) => file.isPlugin && file.output.format === "umd")
        .flatMap((file) => {
          let basename = path.basename(file.output.file, ".js");
          if (basename === "acorn-and-espree") {
            basename = "espree";
          }
          return [
            [`./parser-${basename}`, `./${file.output.file}`],
            [`./parser-${basename}.js`, `./${file.output.file}`],
            [
              `./esm/parser-${basename}.mjs`,
              `./${file.output.file.replace(/\.js$/, ".mjs")}`,
            ],
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
