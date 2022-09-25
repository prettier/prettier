import { pathToFileURL } from "node:url";
import path from "node:path";

function getPrettierInternal() {
  if (process.env.TEST_STANDALONE) {
    const entry = new URL("./require-standalone.cjs", import.meta.url);
    return import(entry).then((module) => module.default);
  }

  const entry = pathToFileURL(
    path.join(
      process.env.PRETTIER_DIR,
      process.env.NODE_ENV === "production" ? "index.mjs" : "index.js"
    )
  );
  return import(entry);
}

let promise;
function getPrettier() {
  promise ??= getPrettierInternal();

  return promise;
}

export default getPrettier;
