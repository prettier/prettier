import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";
import webpack from "webpack";
import packageBuildConfigs from "../../build/packages/index.js";

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (stats.hasErrors()) {
        const { errors } = stats.toJson();
        const error = new Error(errors[0].message);
        error.errors = errors;
        reject(error);
        return;
      }

      resolve(stats);
    });
  });
}

const TEMPORARY_DIRECTORY = url.fileURLToPath(
  new URL("./.tmp", import.meta.url),
);

// Node.js only files
const exclude = new Map([
  [
    "prettier",
    [
      "index.mjs",
      "internal/legacy-cli.mjs",
      "internal/experimental-cli.mjs",
      "internal/experimental-cli-worker.mjs",
    ],
  ],
  ["@prettier/plugin-oxc", ["index.mjs"]],
]);

for (const packageConfig of packageBuildConfigs) {
  const { packageName, distDirectory, modules } = packageConfig;
  const excludedFiles = new Set(exclude.get(packageName));

  /* `require` in `parser-typescript.js`, #12338 */
  for (const module of modules) {
    for (const file of module.files) {
      if (!/\.m?js$/u.test(file.output) || excludedFiles.has(file.output)) {
        continue;
      }
      console.log(`${file.output}: `);

      const stats = await runWebpack({
        mode: "production",
        entry: path.join(distDirectory, file.output),
        output: {
          path: TEMPORARY_DIRECTORY,
          filename: `${file.output}.[contenthash:7].${
            file.output.endsWith(".mjs") ? "mjs" : "cjs"
          }`,
        },
        performance: { hints: false },
        optimization: { minimize: false },
      });
      const result = stats.toJson();
      const { warnings, assets } = result;

      if (warnings.length > 0) {
        console.log(warnings);
        throw new Error("Unexpected webpack warning.");
      }

      if (assets.length > 1) {
        console.log(assets);
        throw new Error("Unexpected assets.");
      }

      const outputFileName = assets[0].name;
      const outputFile = path.join(TEMPORARY_DIRECTORY, outputFileName);
      const require = createRequire(import.meta.url);

      try {
        if (file.output.endsWith(".mjs")) {
          await import(url.pathToFileURL(outputFile));
        } else {
          require(outputFile);
        }
      } catch (error) {
        console.log(`'${outputFileName}' is not functional.`);
        throw error;
      }

      console.log("  Passed.");
    }
  }
}
