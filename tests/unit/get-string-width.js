import fs from "node:fs/promises";
import getStringWidth from "../../src/utils/get-string-width.js";

test("emoji", async () => {
  const strings = await fs.readFile(
    new URL(
      "../../node_modules/emoji-test-regex-pattern/dist/emoji-16.0/index-strings.txt",
      import.meta.url,
    ),
    "utf8",
  );
  for (const emoji of strings.trim().split("\n")) {
    try {
      expect(getStringWidth(emoji)).toBe(2);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Unexpected string width '${emoji}'`);
      throw error;
    }
  }
});
