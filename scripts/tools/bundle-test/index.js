import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";
import webpack from "webpack";
import packageConfigs from "../../build/config.js";

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

for (const packageConfig of packageConfigs) {
  const { distDirectory, files } = packageConfig;
  /* `require` in `parser-typescript.js`, #12338 */
  for (const file of files) {
    if (file.platform !== "universal") {
      continue;
    }
    console.log(`${file.output.file}: `);

    const stats = await runWebpack({
      mode: "production",
      entry: path.join(distDirectory, file.output.file),
      output: {
        path: TEMPORARY_DIRECTORY,
        filename: `${file.output.file}.[contenthash:7].${
          file.output.format === "esm" ? "mjs" : "cjs"
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
      if (file.output.format !== "esm") {
        require(outputFile);
      } else {
        await import(url.pathToFileURL(outputFile));
      }
    } catch (error) {
      console.log(`'${outputFileName}' is not functional.`);
      throw error;
    }

    console.log("  Passed.");
  }
}
