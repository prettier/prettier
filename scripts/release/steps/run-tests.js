import { runYarn, logPromise } from "../utils.js";

export default async function () {
  await logPromise("Running linter", runYarn("lint:eslint"));
  await logPromise("Running Prettier on docs", runYarn("lint:prettier"));
  await logPromise("Running tests", runYarn("test"));
}
