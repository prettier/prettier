import assert from "node:assert/strict";
import { trimTrailingIndentation } from "../src/document/printer/trim-indentation.js";
import { runBenchmark } from "./utilities.js";

for (const size of [1, 1e1, 1e2, 1e3]) {
  const trimmed = "foo".repeat(size / 2);
  const text = trimmed + " \t".repeat(size / 2);

  await runBenchmark(
    {
      name: `Trim indentation (${size} spaces)`,
      assert: (result) => assert.equal(result, trimmed),
    },
    {
      loop: () => trimTrailingIndentation(text),
      "RegExp (inline)": () => text.replace(/[ \t]*$/u, ""),
      "RegExp (stored)": (
        (regexp) => () =>
          text.replace(regexp, "")
      )(/[ \t]*$/gu),
      // eslint-disable-next-line require-unicode-regexp
      "RegExp (no `u` flag)": () => text.replace(/[ \t]*$/, ""),
    },
  );
}
