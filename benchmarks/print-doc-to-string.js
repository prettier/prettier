import assert from "node:assert/strict";
import fs from "node:fs/promises";
import * as prettierDevelopment from "../index.js";
import * as prettierProduction from "../node_modules/prettier/index.mjs";
import { runBenchmark } from "./utilities.js";

assert.notEqual(prettierProduction.version, prettierDevelopment.version);
const text = await fs.readFile(new URL(import.meta.url), "utf8");
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
  {
    Production: () => run(prettierProduction),
    Development: () => run(prettierDevelopment),
  },
);
