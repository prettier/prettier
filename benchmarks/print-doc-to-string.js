import assert from "node:assert/strict";
import fs from "node:fs/promises";
import prettyBytes from "pretty-bytes";
import * as prettierProduction from "../node_modules/prettier/index.mjs";
import * as prettierDevelopment from "../src/index.js";
import { runBenchmark } from "./utilities.js";

assert.notEqual(prettierProduction.version, prettierDevelopment.version);

const text = await fs.readFile(new URL(import.meta.url), "utf8");

for (const size of [1, 1e1, 1e2, 1e3]) {
  const doc = await Promise.all(
    Array.from({ length: size }, (_, index) =>
      // @ts-expect-error -- No types
      prettierDevelopment.__debug.printToDoc(text, {
        parser: "babel",
        cursorOffset: index === 0 ? text.indexOf("cursorOffset") : undefined,
      }),
    ),
  );

  const run = (prettier) =>
    prettier.doc.printer.printDocToString(doc, { printWidth: 80, tabWidth: 2 });

  const expected = await run(prettierProduction);

  await runBenchmark(
    {
      name: `printDocToString (${size}, ${prettyBytes(text.length * size)})`,
      assert: (result) => assert.deepEqual(result, expected),
      warmupIterations: 1,
      iterations: size > 5e3 ? 1 : size > 1e2 ? 2 : undefined,
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
