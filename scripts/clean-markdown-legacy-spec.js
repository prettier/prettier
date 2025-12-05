import fs from "node:fs/promises";
import { commonmark } from "commonmark.json";

const existing = new Set(commonmark.map(({ markdown }) => markdown.trim()));
const DIRECTORY = new URL(
  "../tests/format/markdown/legacy-spec/",
  import.meta.url,
);

for (const file of await fs.readdir(DIRECTORY, { withFileTypes: true })) {
  if (!file.isFile()) {
    continue;
  }
  const fileUrl = new URL(file.name, DIRECTORY);
  const content = await fs.readFile(fileUrl, "utf8");
  if (existing.has(content.trim())) {
    await fs.rm(new URL(file.name, DIRECTORY));
  }
}
