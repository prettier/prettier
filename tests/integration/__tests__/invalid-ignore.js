import path from "node:path";
import prettier from "prettier-local";
import createEsmUtils from "esm-utils";
import runPrettier from "../run-prettier.js";
import jestPathSerializer from "../path-serializer.js";

const { __dirname } = createEsmUtils(import.meta);

expect.addSnapshotSerializer(jestPathSerializer);

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
