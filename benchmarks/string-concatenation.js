import assert from "node:assert/strict";
import { runBenchmark } from "./utilities.js";

for (const size of [1e1, 1e2, 1e3, 1e4, 1e5]) {
  const strings = Array.from({ length: size }, () => "_");
  const expected = strings.join("");

  await runBenchmark(
    {
      name: `String concatenation (${size} strings)`,
      assert: (result) => assert.equal(result, expected),
    },
    {
      "Array#join()"() {
        const result = [];
        for (const string of strings) {
          result.push(string);
        }
        return result.join("");
      },
      "string +="() {
        let result = "";
        for (const string of strings) {
          result += string;
        }
        return result;
      },
    },
  );
}
