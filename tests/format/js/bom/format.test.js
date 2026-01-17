import fs from "node:fs";
const fixtureDirectory = new URL("../eol/", import.meta.url);

const snippets = fs
  .readdirSync(fixtureDirectory)
  .filter(
    (fileName) => fileName !== "__snapshots__" && fileName !== "format.test.js",
  )
  .map((fileName) => {
    const file = new URL(fileName, fixtureDirectory);
    const code = "\uFEFF" + fs.readFileSync(file, "utf8");
    return {
      name: fileName,
      code,
    };
  });

runFormatTest({ importMeta: import.meta, snippets }, ["babel"]);
