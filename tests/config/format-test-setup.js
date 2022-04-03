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

// TODO: Use top-level-await
export default setup();
