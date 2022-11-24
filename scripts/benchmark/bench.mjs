import { readFileSync } from "node:fs";

const [, , version, method, groupCountString = 100, groupSizeString = 10] =
  process.argv;
const groupCount = Number(groupCountString);
const groupSize = Number(groupSizeString);
const { format } = await import(`./${version}/dist/index.js`);

const sourceText = readFileSync(
  process.env.PRETTIER_PERF_FILENAME || "../../src/language-js/utils/index.js",
  "utf8"
);

for (let i = 0; i < groupCount; i++) {
  if (method === "serial") {
    for (let i = 0; i < groupSize; i++) {
      await format(sourceText, { parser: "typescript" });
    }
  }

  if (method === "parallel") {
    await Promise.allSettled(
      Array.from({ length: groupSize }, () =>
        format(sourceText, { parser: "typescript" })
      )
    );
  }
}
