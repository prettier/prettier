import assert from "node:assert/strict";
// import * as prettierDevBundled from "../dist/prettier/index.mjs";
import * as prettierProduction from "../node_modules/prettier/index.mjs";
import * as prettierDevelopment from "../src/index.js";
import { runBenchmark } from "./utilities.js";

assert.notEqual(prettierProduction.version, prettierDevelopment.version);

for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5]) {
  const text = Array.from({ length: size }, () =>
    Math.random() > 0.5 ? " " : Math.random() > 0.5 ? "'" : '"',
  ).join("");
  const run = (prettier) => prettier.util.getPreferredQuote(text, "'");
  const expected = run(prettierProduction);

  await runBenchmark(
    {
      name: `getPreferredQuote (${size} characters)`,
      assert: (result) => assert.deepEqual(result, expected),
    },
    [
      { name: "Development", prettier: prettierDevelopment },
      // { name: "Development(Bundled)", prettier: prettierDevBundled },
      { name: "Production", prettier: prettierProduction },
    ].map(({ name, prettier }) => ({
      name,
      implementation: () => run(prettier),
    })),
  );
}
