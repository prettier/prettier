import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const toPath = (path) => (path instanceof URL ? url.fileURLToPath(path) : path);

async function readJson(file) {
  const data = await fs.readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2) + "\n";
  return writeFile(file, content);
}

async function copyFile(from, to) {
  await createDirectory(path.dirname(toPath(to)));
  return fs.copyFile(from, to);
}

async function createDirectory(directory) {
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch {
    // noop
  }
}

async function writeFile(file, content) {
  await createDirectory(path.dirname(toPath(file)));
  return fs.writeFile(file, content);
}

const PROJECT_ROOT = url.fileURLToPath(new URL("../../", import.meta.url));
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const WEBSITE_DIR = path.join(PROJECT_ROOT, "website");
const SOURCE_DIR = path.join(PROJECT_ROOT, "src");
const PRODUCTION_MINIMAL_NODE_JS_VERSION = "14";

export {
  copyFile,
  DIST_DIR,
  PRODUCTION_MINIMAL_NODE_JS_VERSION,
  PROJECT_ROOT,
  readJson,
  SOURCE_DIR,
  WEBSITE_DIR,
  writeFile,
  writeJson,
};
