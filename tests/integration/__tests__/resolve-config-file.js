import path from "node:path";
import prettier from "prettier-local";
import createEsmUtils from "esm-utils";

const { __dirname } = createEsmUtils(import.meta);

test("API resolveConfigFile", async () => {
  const result = await prettier.resolveConfigFile();
  expect(result).toEqual(path.join(__dirname, "../../../.prettierrc"));
});

test("API resolveConfigFile.sync", () => {
  const result = prettier.resolveConfigFile.sync();
  expect(result).toEqual(path.join(__dirname, "../../../.prettierrc"));
});
