import assert from "node:assert/strict";
import { runBenchmark } from "./utilities.js";

for (const size of [1e1, 1e2, 1e3, 1e4, 1e5]) {
  const maxLength = 10;
  const seperator = "|";
  const strings = Array.from({ length: size }, () => "_");
  const expected = {
    length: strings.join(seperator).length,
    times: Math.floor(size / maxLength) - 1,
  };

  await runBenchmark(
    {
      name: `String buffer compress (${size} strings)`,
      assert: (result) => assert.deepEqual(result, expected),
    },
    {
      "Array#splice()"() {
        const result = [];
        let times = 0;

        for (let index = 0; index < strings.length; index++) {
          result.push(strings[index]);
          if (result.length > maxLength) {
            result.splice(0, Number.POSITIVE_INFINITY, result.join(seperator));
            assert.equal(result.length, 1);
            times++;
          }
        }

        return { length: result.join(seperator).length, times };
      },
      "let reassign"() {
        let result = [];
        let times = 0;

        for (let index = 0; index < strings.length; index++) {
          result.push(strings[index]);
          if (result.length > maxLength) {
            result = [result.join(seperator)];
            assert.equal(result.length, 1);
            times++;
          }
        }

        return { length: result.join(seperator).length, times };
      },
    },
  );
}
