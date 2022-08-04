import { readFileSync } from "node:fs";

const [, , version, method, groupCountString = 100, groupSizeString = 10] =
  process.argv;
const groupCount = Number(groupCountString);
const groupSize = Number(groupSizeString);
const { format } = await import(`./${version}/dist/index.js`);

const sourceText = readFileSync("../../src/language-js/utils/index.js", "utf8");

for (let i = 0; i < groupCount; i++) {
  if (method === "serial") {
    for (let i = 0; i < groupSize; i++) {
      await format(sourceText, { parser: "typescript" });
    }
  }

  if (method === "parallel") {
    const promises = [];
    for (let i = 0; i < groupSize; i++) {
      promises.push(format(sourceText, { parser: "typescript" }));
    }
    await Promise.allSettled(promises);
  }
}
