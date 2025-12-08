import fs from "node:fs/promises";
import commonmarkTestSuite from "commonmark-test-suite";

const existing = new Set(
  Object.values(commonmarkTestSuite).flatMap((release) =>
    release.testCases.map(({ markdown }) => markdown.trim()),
  ),
);

const DIRECTORIES = [
  new URL("../tests/format/markdown/spec-legacy/", import.meta.url),
];

for (const directory of DIRECTORIES) {
  for (const file of await fs.readdir(directory, { withFileTypes: true })) {
    if (!file.isFile()) {
      continue;
    }
    const fileUrl = new URL(file.name, directory);
    const content = await fs.readFile(fileUrl, "utf8");
    if (existing.has(content.trim())) {
      await fs.rm(new URL(file.name, directory));
    }
  }
}
