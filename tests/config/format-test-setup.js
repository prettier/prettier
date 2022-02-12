import createEsmUtils from "esm-utils";
import getPrettier from "./get-prettier.js";
import runSpec from "./format-test.js";

async function setup() {
  const { TEST_STANDALONE } = process.env;

  const prettier = TEST_STANDALONE
    ? createEsmUtils(import.meta).require("./require-standalone.cjs")
    : await getPrettier();

  runSpec.prettier = prettier;

  globalThis.run_spec = runSpec;
}

// `await`ed in `./jest-light-runner/worker-runner.js`
// Use top-level await in `./prettier-entry.js` when we drop support for Node.js 12
export { setup };
