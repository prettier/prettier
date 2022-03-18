import { fileURLToPath } from "node:url";
import path from "node:path";
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
  const PROBLEMATIC_WARNING_MESSAGE =
    "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted";

  const stats = await runWebpack({
    mode: "production",
    entry: path.join(DIST_DIR, "parser-typescript.js"),
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
