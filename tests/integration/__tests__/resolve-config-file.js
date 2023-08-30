import * as urlOrPath from "url-or-path";
import prettier from "../../config/prettier-entry.js";

test("API resolveConfigFile", async () => {
  const result = await prettier.resolveConfigFile();
  expect(result).toEqual(
    urlOrPath.toPath(new URL("../../../.prettierrc", import.meta.url)),
  );
});

test("API resolveConfigFile accepts path or URL", async () => {
  const fileUrl = new URL("../cli/config/filepath/foo.js", import.meta.url);
  const expectedConfigFilePath = urlOrPath.toPath(
    new URL("./.prettierrc", fileUrl),
  );

  const resultByUrl = await prettier.resolveConfigFile(fileUrl);
  const resultByUrlHref = await prettier.resolveConfigFile(fileUrl.href);
  const resultByPath = await prettier.resolveConfigFile(
    urlOrPath.toPath(fileUrl),
  );
  expect(resultByUrl).toEqual(expectedConfigFilePath);
  expect(resultByUrlHref).toEqual(expectedConfigFilePath);
  expect(resultByPath).toEqual(expectedConfigFilePath);
});
