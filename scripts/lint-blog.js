#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import createEsmUtils from "esm-utils";

const { __dirname } = createEsmUtils(import.meta);

const blogPostDir = path.join(__dirname, "../website/blog");

const files = fs.readdirSync(blogPostDir);

for (const file of files) {
  if (file.endsWith(".md") && !includesTruncateComment(file)) {
    console.error(`${file}: Should include a <!--truncate--> comment`);
    process.exitCode = 1;
  }
}

function includesTruncateComment(file) {
  const data = fs.readFileSync(path.join(blogPostDir, file), "utf8");
  return data.includes("<!--truncate-->");
}
