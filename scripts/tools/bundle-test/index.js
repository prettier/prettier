import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import webpack from "webpack";
import { DIST_DIR } from "../../../scripts/utils/index.mjs";

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

const TEMPORARY_DIRECTORY = fileURLToPath(new URL("./.tmp", import.meta.url));

/* `require` in `parser-typescript.js`, #12338 */
(async () => {
  const esmFilesDirectory = path.join(DIST_DIR, "esm");

  const files = [
    (await fs.readdir(DIST_DIR))
      .filter(
        (name) =>
          name.startsWith("parser-") ||
          name === "standalone.js" ||
          name === "doc.js"
      )
      .map((name) => ({ name, file: path.join(DIST_DIR, name) })),
    (await fs.readdir(esmFilesDirectory)).map((name) => ({
      displayName: `esm/${name}`,
      name,
      file: path.join(esmFilesDirectory, name),
    })),
  ].flat();

  for (const { displayName, name, file } of files) {
    console.log(`${displayName || name}: `);

    const stats = await runWebpack({
      mode: "production",
      entry: file,
      output: {
        path: TEMPORARY_DIRECTORY,
        filename: `${name}.[contenthash:7].js`,
      },
      performance: { hints: false },
      optimization: { minimize: false },
    });
    const result = stats.toJson();
    const { warnings } = result;

    if (warnings.length > 0) {
      console.log(warnings);
      throw new Error("Unexpected webpack warning.");
    }

    console.log("  Passed.");
  }
})();
