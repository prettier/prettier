"use strict";

const path = require("path");
const prettier = require("prettier-local");
const runPrettier = require("../run-prettier.js");

expect.addSnapshotSerializer(require("../path-serializer.js"));

describe("throw error with invalid ignore", () => {
  runPrettier("cli/invalid-ignore", ["something.js"]).test({
    status: "non-zero",
  });

  test("sync api", async () => {
    await expect(
      prettier.getFileInfo("something.js", {
        ignorePath: path.join(
          __dirname,
          "../cli/invalid-ignore/.prettierignore"
        ),
      })
    ).rejects.toThrow(/EISDIR: illegal operation on a directory/);
  });
});
