import assert from "node:assert/strict";
import fs from "node:fs/promises";
import * as prettierProduction from "../node_modules/prettier/index.mjs";
import * as prettierDevelopment from "../src/index.js";
import { runBenchmark } from "./utilities.js";

assert.notEqual(prettierProduction.version, prettierDevelopment.version);

const text = await fs.readFile(new URL(import.meta.url), "utf8");
// @ts-expect-error -- No types
const doc = await prettierDevelopment.__debug.printToDoc(text, {
  parser: "babel",
  cursorOffset: text.indexOf("cursorOffset"),
});

const run = (prettier) =>
  prettier.doc.printer.printDocToString(doc, { printWidth: 80, tabWidth: 2 });

const expected = await run(prettierProduction);

await runBenchmark(
  {
    name: "printDocToString",
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
