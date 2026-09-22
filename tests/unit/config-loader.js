import fs from "node:fs/promises";
import path from "node:path";
import { temporaryDirectory as getTemporaryDirectory } from "tempy";
import loadConfig from "../../src/config/prettier-config/load-config.js";

describe("Support BOM", () => {
  const files = [
    { filename: "package.json", content: '{"prettier": {"tabWidth": 5}}' },
    { filename: ".prettierrc", content: "tabWidth: 5" },
    { filename: ".prettierrc.json", content: '{"tabWidth": 5}' },
    { filename: ".prettierrc.yml", content: "tabWidth: 5" },
    { filename: ".prettierrc.json5", content: "{tabWidth: 5}" },
    { filename: ".prettierrc.toml", content: "tabWidth = 5" },
  ];

  const directory = getTemporaryDirectory();
  const expected = { tabWidth: 5 };
  afterAll(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  for (const { filename, content } of files) {
    test(filename, async () => {
      const file = path.join(directory, filename);
      await fs.writeFile(file, `\ufeff${content}`);
      const config = await loadConfig(file);
      expect(config).toStrictEqual(expected);
    });
  }
});
