import url from "node:url";
import prettier from "../../config/prettier-entry.js";

test("API resolveConfigFile", async () => {
  const result = await prettier.resolveConfigFile();
  expect(result).toEqual(
    url.fileURLToPath(new URL("../../../.prettierrc", import.meta.url)),
  );
});

test("API resolveConfigFile accepts path or URL", async () => {
  const fileUrl = new URL("../cli/config/filepath/foo.js", import.meta.url);
  const expectedConfigFilePath = url.fileURLToPath(
    new URL("./.prettierrc", fileUrl),
  );

  const resultByUrl = await prettier.resolveConfigFile(fileUrl);
  const resultByUrlHref = await prettier.resolveConfigFile(fileUrl.href);
  const resultByPath = await prettier.resolveConfigFile(
    url.fileURLToPath(fileUrl),
  );
  expect(resultByUrl).toEqual(expectedConfigFilePath);
  expect(resultByUrlHref).toEqual(expectedConfigFilePath);
  expect(resultByPath).toEqual(expectedConfigFilePath);
});
