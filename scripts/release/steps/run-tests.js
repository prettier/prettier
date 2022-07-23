import { runYarn, logPromise } from "../utils.js";

export default async function runTests() {
  await logPromise("Running linter", runYarn("lint:eslint"));
  await logPromise("Running Prettier on docs", runYarn("lint:prettier"));
  await logPromise("Running tests", runYarn("test"));
}
