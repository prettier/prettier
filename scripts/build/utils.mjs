import fs from "node:fs/promises";

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

export { readJson, writeJson, copyFile };
