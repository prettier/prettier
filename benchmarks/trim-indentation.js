import assert from "node:assert/strict";
import { trimIndentation } from "../src/document/printer/trim-indentation.js";
import { runBenchmark } from "./utilities.js";

for (const size of [1, 1e1, 1e2]) {
  const trimmed = "foo".repeat(size / 2);
  const text = trimmed + " \t".repeat(size / 2);

  await runBenchmark(
    {
      name: `Trim indentation (${size} spaces)`,
      assert: (result) => assert.equal(result, trimmed),
    },
    {
      loop: () => trimIndentation(text).text,
      "RegExp (inline)": () => text.replace(/[ \t]*$/u, ""),
      "RegExp (stored)": (
        (regexp) => () =>
          text.replace(regexp, "")
      )(/[ \t]*$/gu),
      "RegExp (no `u` flag)": () => text.replace(/[ \t]*$/, ""),
    },
  );
}
