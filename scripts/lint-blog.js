#!/usr/bin/env node

import fs from "node:fs";

const blogPostDir = new URL("../website/blog/", import.meta.url);

const files = fs.readdirSync(blogPostDir);

for (const file of files) {
  if (file.endsWith(".md")) {
    const fileData = fs.readFileSync(new URL(file, blogPostDir), "utf8");
    if (!fileData.includes("<!--truncate-->")) {
      console.error(`${file}: Should include a <!--truncate--> comment`);
      process.exitCode = 1;
    }
  }
}
