import assert from "node:assert/strict";
import fs from "node:fs/promises";
import * as prettierProduction from "../node_modules/prettier/index.mjs";
import * as prettierDevelopment from "../src/index.js";
import { runBenchmark } from "./utilities.js";

assert.notEqual(prettierProduction.version, prettierDevelopment.version);

for (const size of [1e1, 1e2, 1e3, 1e4, 1e5]) {
  const text = "'\"".repeat(size);
  const run = (prettier) => prettier.util.getPreferredQuote(text, "'");
  const expected = run(prettierProduction);

  await runBenchmark(
    {
      name: `getPreferredQuote (${size})`,
      assert: (result) => assert.deepEqual(result, expected),
    },
    [
      { name: "Development", prettier: prettierDevelopment },
      { name: "Production", prettier: prettierProduction },
    ].map(({ name, prettier }) => ({
      name,
      implementation: () => run(prettier),
    })),
  );
}
