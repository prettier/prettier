import fs from "node:fs/promises";
import url from "node:url";
import path from "node:path";

async function readJson(file) {
  const data = await fs.readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return writeFile(file, content);
}

async function copyFile(from, to) {
  const data = await fs.readFile(from);
  return writeFile(to, data);
}

async function writeFile(file, content) {
  const directory = path.dirname(file);
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch {
    // noop
  }
  return fs.writeFile(file, content);
}

const PROJECT_ROOT = url.fileURLToPath(new URL("../../", import.meta.url));
const BUILD_CACHE_DIR = path.join(PROJECT_ROOT, ".cache");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const WEBSITE_DIR = path.join(PROJECT_ROOT, "website");

export {
  PROJECT_ROOT,
  DIST_DIR,
  BUILD_CACHE_DIR,
  WEBSITE_DIR,
  readJson,
  writeJson,
  writeFile,
  copyFile,
};
