import fs from "node:fs/promises";
import url from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

async function readJson(file) {
  const data = await fs.readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return fs.writeFile(file, content);
}

async function copyFile(from, to) {
  const data = await fs.readFile(from);
  return fs.writeFile(to, data);
}

function commonjsObjects(importMeta) {
  return {
    get __filename() {
      return url.fileURLToPath(importMeta.url);
    },
    get __dirname() {
      return path.dirname(url.fileURLToPath(importMeta.url));
    },
    get require() {
      return createRequire(importMeta.url);
    },
  };
}

export { commonjsObjects, readJson, writeJson, copyFile };
