import path from "node:path";
import createEsmUtils from "esm-utils";
import prettier from "../../config/prettier-entry.js";

const { __dirname } = createEsmUtils(import.meta);

test("API resolveConfigFile", async () => {
  const result = await prettier.resolveConfigFile();
  expect(result).toEqual(path.join(__dirname, "../../../.prettierrc"));
});
