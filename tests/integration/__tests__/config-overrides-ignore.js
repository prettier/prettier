import url from "node:url";
import prettier from "../../config/prettier-entry.js";

// TODO: Support url directly
const isIgnored = async (file) => {
  const filepath = url.fileURLToPath(new URL(file, import.meta.url));
  const { ignored } = await prettier.getFileInfo(filepath);
  return ignored;
};

test("getFileInfo", async () => {
  await expect(
    isIgnored("../cli/config/overrides-ignore/ignore/ignored.js"),
  ).resolves.toBe(true);
  await expect(
    isIgnored("../cli/config/overrides-ignore/ignore/not-ignored.js"),
  ).resolves.toBe(false);
});

describe("CLI", () => {
  runCli("cli/config/overrides-ignore/ignore/", ["ignored.js"]).test({
    stdout: "",
    stderr: "",
    status: 0,
    write: [],
  });
  runCli("cli/config/overrides-ignore/ignore/", ["not-ignored.js"]).test({
    stdout: "foo();",
    stderr: "",
    status: 0,
    write: [],
  });
});
