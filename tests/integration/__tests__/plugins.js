import url from "node:url";
import prettier from "../../config/prettier-entry.js";

const pluginUrl = new URL(
  "../../config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js",
  import.meta.url,
);

test("plugins", async () => {
  const input = "foo";
  const expectedOutput = "FOO\n";

  await expect(
    prettier.format(input, {
      parser: "uppercase-rocks",
      plugins: [pluginUrl],
    }),
  ).resolves.toEqual(expectedOutput);

  await expect(
    prettier.format(input, {
      parser: "uppercase-rocks",
      plugins: [pluginUrl.href],
    }),
  ).resolves.toEqual(expectedOutput);
  await expect(
    prettier.format(input, {
      parser: "uppercase-rocks",
      plugins: [url.fileURLToPath(pluginUrl)],
    }),
  ).resolves.toEqual(expectedOutput);
});
