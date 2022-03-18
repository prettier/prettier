import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
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
  try {
    await fs.mkdir(TEMPORARY_DIRECTORY);
  } catch {
    // No op
  }

  const relativePath = path
    .relative(TEMPORARY_DIRECTORY, DIST_DIR)
    .replaceAll("\\", "/");

  const PROBLEMATIC_WARNING_MESSAGE =
    "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted";
  const inputFile = path.join(TEMPORARY_DIRECTORY, getRandomFileName("input"));
  await fs.writeFile(
    inputFile,
    `import "${relativePath}/parser-typescript.js"`
  );

  const stats = await runWebpack({
    mode: "production",
    entry: inputFile,
    output: {
      path: TEMPORARY_DIRECTORY,
      filename: getRandomFileName("output"),
    },
  });
  const result = stats.toJson();
  const { warnings } = result;
  const error = warnings.find(
    ({ message }) => message === PROBLEMATIC_WARNING_MESSAGE
  );
  if (error) {
    console.error(error);
    throw new Error("Unexpected webpack warning.");
  }
})();
