import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";
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

const getRandomFileName = (prefix) =>
  prefix + "-" + crypto.randomBytes(4).toString("hex").slice(0, 4) + ".js";

const TEMPORARY_DIRECTORY = fileURLToPath(new URL("./.tmp", import.meta.url));

/* `require` in `parser-typescript.js`, #12338 */
(async () => {
  const files = await fs.readdir(DIST_DIR);
  for (const file of files) {
    if (
      !(
        file.startsWith("parser-") ||
        file === "standalone.js" ||
        file === "doc.js"
      )
    ) {
      continue;
    }

    console.log(`Testing ${file}: `);

    const stats = await runWebpack({
      mode: "production",
      entry: path.join(DIST_DIR, file),
      output: {
        path: TEMPORARY_DIRECTORY,
        filename: getRandomFileName(file),
      },
    });
    const result = stats.toJson();
    const warnings = result.warnings.filter(
      ({ message }) =>
        !(
          message.startsWith("entrypoint size limit:") ||
          message.startsWith("asset size limit:") ||
          message.startsWith("webpack performance recommendations:")
        )
    );

    if (warnings.length > 0) {
      console.log(warnings);
      throw new Error("Unexpected webpack warning.");
    }

    console.log("Passed.");
  }
})();
