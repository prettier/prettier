import path from "node:path";
import createEsmUtils from "esm-utils";
import prettier from "../../config/prettier-entry.js";

const { __dirname } = createEsmUtils(import.meta);

describe("throw error with invalid ignore", () => {
  runCli("cli/invalid-ignore", ["something.js"]).test({
    status: "non-zero",
  });

  test("sync api", async () => {
    await expect(
      prettier.getFileInfo("something.js", {
        ignorePath: path.join(
          __dirname,
          "../cli/invalid-ignore/.prettierignore",
        ),
      }),
    ).rejects.toThrow(/EISDIR: illegal operation on a directory/u);
  });
});
