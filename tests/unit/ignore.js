import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createFastGlobIgnorePatterns } from "../../src/utilities/ignore.js";

async function withTemporaryCwd(callback) {
  const cwd = process.cwd();
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "prettier-ignore-"),
  );

  try {
    process.chdir(directory);
    await callback();
  } finally {
    process.chdir(cwd);
    await fs.rm(directory, { force: true, recursive: true });
  }
}

test("creates fast-glob patterns for safe ignore entries", async () => {
  await withTemporaryCwd(async () => {
    await fs.writeFile(
      ".prettierignore",
      ["dist", "coverage/", "nested/cache", "# comment", "*.js"].join("\n"),
    );

    await expect(
      createFastGlobIgnorePatterns([".prettierignore"]),
    ).resolves.toStrictEqual([
      "**/dist",
      "**/dist/**",
      "**/coverage/**",
      "nested/cache",
      "nested/cache/**",
    ]);
  });
});

test("skips fast-glob patterns when ignore files contain negations", async () => {
  await withTemporaryCwd(async () => {
    await fs.writeFile(".prettierignore", "dist\n!dist/keep.js\n");

    await expect(
      createFastGlobIgnorePatterns([".prettierignore"]),
    ).resolves.toStrictEqual([]);
  });
});

test("scopes basename patterns to the ignore file directory", async () => {
  await withTemporaryCwd(async () => {
    await fs.mkdir("config");
    await fs.writeFile("config/.prettierignore", "cache\n");

    await expect(
      createFastGlobIgnorePatterns(["config/.prettierignore"]),
    ).resolves.toStrictEqual(["config/**/cache", "config/**/cache/**"]);
  });
});
