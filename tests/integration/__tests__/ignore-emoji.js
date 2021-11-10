"use strict";
const path = require("path");
const prettier = require("prettier-local");
const runPrettier = require("../runPrettier.js");

expect.addSnapshotSerializer(require("../path-serializer.js"));

describe("ignores file name contains emoji", () => {
  runPrettier("cli/ignore-emoji", ["**/*.js", "-l"]).test({
    status: 1,
  });
});

test("API getFileInfo should ignore files contains emoji", async () => {
  await expect(
    prettier.getFileInfo(
      path.join(__dirname, "../cli/ignore-emoji/ignored/我的样式.css"),
      {
        ignorePath: path.join(__dirname, "../cli/ignore-emoji/.prettierignore"),
      }
    )
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});
